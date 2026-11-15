# PRIMAL CORE — read-only audit and change plan

**Historical snapshot:** This report describes commit f443f01 before the subsequently requested flag/form/Supabase changes. For current activation steps and remaining work, see SUPABASE_SETUP.md. Original statuses below are not a re-audit of the updated implementation.

Audit date: 15 November 2026 (Europe/Athens). Repository: `booksfordazzle/chatgpt`; branch: `codex/bilingual-site`; audited commit: `f443f01c587f59669ade8a95a0286d4c07bdf9cc`.

**No implementation is authorised by this report.** Only this report was created in the project. No application, dependency, schema, configuration, or Greek copy was changed. No deployment, remote signup, email delivery, database mutation, migration, commit, or push was performed for this audit. Build output, browser evidence and Lighthouse output were written under `/tmp`, outside the project.

## Scope, evidence and important discrepancies

The requested Next.js + Supabase implementation is **not present in this checkout**. The actual product is a dependency-free static Greek/English website with a Node development server, a Netlify function and a Google Apps Script / Google Sheets receiver. The code does not establish that a different deployed Next.js/Supabase app does not exist. Confirm the intended repository/deployment before approving a backend replacement.

Evidence: `package.json:5` declares ES modules; `package.json:6` requires Node >=22; `package.json:8` starts `scripts/serve.mjs`; `package.json:9` runs the custom static build; `netlify.toml:3` publishes `dist`; `netlify.toml:4` selects Netlify functions; `google-apps-script/Code.gs:15` opens a spreadsheet. The full current project-file inventory contains no Next configuration, app/pages routes, Supabase client, SQL migrations or database schema. `PRODUCT.md:23` independently describes the static/Netlify/Sheets architecture.

Customer-facing content is **bilingual**, not Greek-only: 17 Greek pages have 17 complete English counterparts; see `tests/languages.test.mjs:18`, `public/index.html:3` and `public/en/index.html:3`. This audit prioritises the Greek landing page and includes English parity and linked-page risks.

Status meanings: **PASS** = the requested capability is evidenced in the stated local/source scope; **PARTIAL** = some elements exist but there is a verified gap; **MISSING** = absent from the inspected implementation; **UNVERIFIED** = requires deployed configuration, private evidence or a live service that was not available. A source PASS is not a production certification. Impact is conversion or legal/data risk, not implementation size. HIGH does not imply a measured conversion uplift.

Many HTML documents are minified onto physical **line 3**. Citations to that line are exact; selectors, headings and quoted text below disambiguate the location. Absence findings refer to the complete relevant surface/handler rather than inventing a line for missing code.

### Architecture map

| Area | Actual implementation and evidence |
| --- | --- |
| Framework/runtime | No frontend framework or package dependencies declared. Package version 1.0.0; ES modules; Node >=22 (`package.json:2`, `package.json:5`, `package.json:6`). Current runtime Node 24.22.1 / npm 11.9.0; Netlify pins Node 22 (`netlify.toml:6`). |
| Routing | Static `public/*.html` and `public/blog/*.html`; English mirrors under `public/en/`. `index.html:1` redirects a downloaded bundle into `public/index.html`. Native links and browser hash anchors, not Next routing. |
| Components | HTML repeated across documents. Shared styling `public/styles.css:3`; shared behaviour `public/site.js:20`. Philosophy/history use route-specific CSS/JS (`public/philosophy.html:3`, `public/about.html:3`). There are no React components to edit. |
| Form/API | Two independent forms in `public/index.html:3` (`.hero-signup` and `#waitlist`), shared submit code `public/site.js:29`; POST `/api/waitlist` is rewritten to the Netlify function (`netlify.toml:7`). Dev adapter dispatches the same handler (`scripts/serve.mjs:10`). |
| Storage | Apps Script `doPost` authenticates via shared secret, validates consent/email, locks, deduplicates and writes a `Waitlist` tab (`google-apps-script/Code.gs:2`, `:11`, `:14`, `:18`, `:23`, `:29`). There is no Supabase table, SQL unique constraint or RLS configuration in this repository. |
| Environment | Function reads `GOOGLE_APPS_SCRIPT_URL` and `WAITLIST_SHARED_SECRET` (`netlify/functions/waitlist.mjs:30`); Apps Script properties require `SPREADSHEET_ID` and its matching secret (`google-apps-script/Code.gs:10`, `:15`). Build reads `OUTPUT_DIR`/`SITE_URL` (`scripts/build.mjs:3`, `:5`); dev server reads `PORT` (`scripts/serve.mjs:32`). Example values are blank/defaults (`.env.example:2`). Dev server does not load `.env` automatically (`README.md:42`). |
| Third parties | Browser loads self-hosted fonts, scripts and media; no analytics, ad pixels, captcha or email SDK is declared in the relevant HTML/JS or manifest (`public/index.html:3`, `public/site.js:1`, `package.json:7`). Browser network observations found no external requests during the three local initial-load checks. Server-side storage uses Google Apps Script (`netlify/functions/waitlist.mjs:31`). This does not verify host-injected production scripts. |
| Build/deploy | `scripts/build.mjs:4` copies `public`, then adds canonical/social metadata, robots and sitemap (`:17`, `:24`, `:25`). Netlify serves `dist`, functions, rewrite and security headers (`netlify.toml:1`, `:7`, `:12`). No CI workflow is present in the inspected tracked tree. |

### Signup flow — 10 lines

1. Each Greek homepage form asks for email plus an unchecked, required launch-update consent checkbox (`public/index.html:3`).
2. Browser-native email/required/length checks run, followed by `form.reportValidity()` (`public/index.html:3`; `public/site.js:33`).
3. A downloaded `file:` preview explains that signup is unavailable instead of pretending to save (`public/site.js:28`, `:35`).
4. JS disables the button, sets busy/Greek loading states, then POSTs email, consent, locale and honeypot to `/api/waitlist` (`public/site.js:41`, `:48`).
5. Netlify rewrites the URL to its function; the local server calls the same function directly (`netlify.toml:8`; `scripts/serve.mjs:12`).
6. The function checks method, origin, payload, email, consent and honeypot, then requires the Google endpoint and secret (`netlify/functions/waitlist.mjs:10`, `:13`, `:25`, `:27`, `:30`).
7. It forwards the email, consent, privacy version and fixed source to Google Apps Script, not Supabase (`netlify/functions/waitlist.mjs:33`, `:36`).
8. Apps Script revalidates, locks, checks case-insensitive duplicates and writes the email/time/consent/version/source to Sheets (`google-apps-script/Code.gs:11`, `:14`, `:23`, `:29`).
9. Only upstream `{ok:true}` leads to API success; duplicates get the same generic success, and failures cannot claim a confirmed save (`netlify/functions/waitlist.mjs:38`; `google-apps-script/Code.gs:32`).
10. JS shows Greek success and resets only after confirmation; errors retain the email; native forms redirect to localised status pages (`public/site.js:54`, `:57`; `netlify/functions/waitlist.mjs:9`).

## 1. Summary table — all 31 checklist items

**Counts: PASS 9 · PARTIAL 13 · MISSING 8 · UNVERIFIED 1 = 31.** Subchecks marked UNVERIFIED remain so even inside another primary status.

| # | Checklist item | Status | Impact | Evidence | Gap / finding |
| --- | --- | --- | --- | --- | --- |
| 1 | Greek outcome headline + subheadline | PARTIAL | HIGH | `public/index.html:3`, `#hero-title`; `public/styles.css:48` | Outcome headline exists. No explanatory subheadline identifying the men's balm / development stage. At 375px, computed heading is only 16.875px. |
| 2 | Real product/texture photo above fold; five supplied tin photos | PARTIAL | HIGH | `public/index.html:3`, `.hero-poster`, `.product-image`; `README.md:57` | Initial mobile and desktop view shows a closed tin. Open balm texture image starts around y=2443 at 375×812, far below fold. Use and authenticity of the specific five supplied tin photos are UNVERIFIED: no five-photo identity/provenance manifest is available. |
| 3 | Email-only form on first mobile screen | PASS | HIGH | `public/index.html:3`, `.hero-signup`; `public/styles.css:190`, `:195` | One visible personal-data field; consent is separate and necessary. Email, CTA and consent fit in both 375×812 and 375×667 local views. Hidden locale/honeypot are not additional customer questions. |
| 4 | Specific CTA | PASS | MEDIUM | `public/index.html:3`, both submit buttons | “Μπες στη λίστα” names the action. No generic Submit/Subscribe text. Clearer launch context can be tested after item 1. |
| 5 | Privacy microcopy under form | PASS | HIGH | `public/index.html:3`, both `.consent` labels; `public/privacy.html:3` | Unchecked explicit consent and linked Greek privacy policy are present under both forms. Operational privacy omissions are tracked separately in item 28. |
| 6 | No menu/social/outbound distractions before signup | PARTIAL | MEDIUM | `public/index.html:3`, `.site-header`, `#navigation`, `.language-switch` | No social icons or third-party marketing links above the form, but menu and EL/EN page navigation exist. Required privacy access must not be removed to satisfy this heuristic. |
| 7 | Concrete recognition section | MISSING | MEDIUM | `public/index.html:3`, direct hero → `.ritual` sequence | No homepage section about post-shower tightness, shaving or a simple routine. Such situations appear in linked articles, e.g. `public/blog/tallow-skincare.html:3`, not the landing sequence. |
| 8 | Three outcome-focused benefits | PASS | MEDIUM | `public/index.html:3`, `.benefit-list` | Exactly three benefits are present: dehydration lines, intensive hydration, smooth/rested appearance. This is a structural PASS only; evidence requirements remain in item 13. |
| 9 | Trust: real assets, ingredients, status, founder/story | PARTIAL | HIGH | `public/index.html:3`; `public/about.html:5`, `:6`; `public/assets/philosophy/provenance.json:4` | Product status/caption and ingredient descriptions exist; story is on another page. No identified founder or founder face is established. Actual product-photo provenance is UNVERIFIED; known generated marble/bottle artwork must not be presented as documentary trust evidence. |
| 10 | Reason to join now + launch timeline/cadence | PARTIAL | HIGH | `public/index.html:3`, `.waitlist-offer`, availability FAQ; `PRODUCT.md:15` | Existing 15% early-bird offer is only by the bottom form; terms, eligibility, expiry and ability to honour it are UNVERIFIED. No date or update cadence; FAQ says date will be announced after checks. No invented countdown. |
| 11 | Short FAQ: grease, use, suitability, availability | PARTIAL | MEDIUM | `public/index.html:3`, `#faq` | Seven questions cover use, suitability and availability. No direct “will it feel greasy?” answer. Dry-skin/use/duration/scent answers state unsettled properties and need item 13 review. |
| 12 | Repeated bottom form/CTA | PASS | MEDIUM | `public/index.html:3`, `#waitlist`; `public/styles.css:199`; `public/site.js:29` | Separate bottom form exists with unique IDs and shared submission handler; stacks after FAQ on mobile. |
| 13 | Claims + fabricated proof/scarcity review | PARTIAL | HIGH | `public/index.html:3`, benefit/ingredient/FAQ blocks; `PRODUCT.md:35`; `public/blog/hippocrates-tallow-mastic.html:3` | Claim inventory below identifies unsupported repair, antibacterial, regeneration, firming, oil-regulation and ageing claims. Evidence is not supplied. No testimonials, membership counters, certification logos or fabricated scarcity found on homepage; 15% is an unverified offer, not proof of demand. |
| 14 | Client + server validation | PASS | HIGH | `public/site.js:33`; `netlify/functions/waitlist.mjs:13`, `:14`, `:27`, `:28`; `google-apps-script/Code.gs:11`, `:13` | Native client validation plus independent API and receiver validation exist. Existing tests exercise invalid email/consent, endpoint restrictions and cross-origin rejection. |
| 15 | Greek loading/success/error | PASS | HIGH | `public/site.js:41`, `:45`, `:55`, `:59` | Actual local 503 produces Greek error and retains input. Loading and success rendered correctly with an explicitly intercepted local mock; that success test does NOT prove persistence. Browser-native invalid-email text follows browser locale and is not guaranteed Greek. |
| 16 | Friendly duplicate handling without DB errors | PASS | HIGH | `google-apps-script/Code.gs:14`, `:23`, `:32`; `tests/receiver.test.mjs:13`; `netlify/functions/waitlist.mjs:8` | Case-insensitive duplicate check under lock returns the same generic success without membership disclosure. Receiver test confirms one row for case variants. Live deployed duplication/concurrency remains UNVERIFIED. No SQL unique constraint exists. |
| 17 | Real Supabase persistence / schema / unique / timestamps / RLS | MISSING | HIGH | `package.json:7`; `netlify/functions/waitlist.mjs:31`, `:36`; `google-apps-script/Code.gs:18`, `:29` | No Supabase implementation or migrations exist. Current local Google credentials are unset and actual POST returns 503 `not_configured`. Production Sheets persistence, access permissions and published endpoint are UNVERIFIED. Do not infer readiness from mocked tests. |
| 18 | Bot/abuse protection | PASS | HIGH | `public/index.html:3`, `.honey`; `netlify/functions/waitlist.mjs:14`, `:25`; `google-apps-script/Code.gs:11` | Honeypot, size caps, validation and receiver secret meet the requested minimum “honeypot OR rate limit OR captcha”. No rate limit/captcha exists. Origin checks are not a bot defence; paid-traffic resilience needs additional protection. |
| 19 | Full attribution + consent fields | PARTIAL | HIGH | `public/site.js:50`; `netlify/functions/waitlist.mjs:36`; `google-apps-script/Code.gs:18`, `:29` | Email, registration UTC time, consent=true, privacy version, fixed source are stored by code. No distinct consent timestamp, consent-text version, UTM, referrer, locale or separate created_at field; registration time is the available receipt time. Actual stored rows UNVERIFIED. |
| 20 | Welcome email / provider | MISSING | MEDIUM | `netlify/functions/waitlist.mjs:33`; `google-apps-script/Code.gs:29`; `README.md:40` | No welcome/confirmation email is sent by this implementation; no provider integration/env exists. README explicitly says the receiver sends no mail. An external Sheets automation is UNVERIFIED, not assumed. |
| 21 | Thank-you explains next step | PARTIAL | MEDIUM | `public/site.js:55`; `public/thanks.html:3`; `netlify/functions/waitlist.mjs:9` | Confirms signup and future launch news; no expected frequency, welcome-email expectation or offer terms. Directly opening the static thanks page is not evidence of a saved signup. |
| 22 | Queue position | MISSING | LOW | `public/site.js:55`; `public/thanks.html:3`; API response `netlify/functions/waitlist.mjs:8` | No queue/rank field or UI. Optional acquisition feature, not a release blocker; no position should be fabricated. |
| 23 | Unique referral link + tracking | MISSING | LOW | `public/site.js:50`; `netlify/functions/waitlist.mjs:36`; `google-apps-script/Code.gs:18` | No referral code, attribution, events, token or referral UI. Optional, with privacy/fraud implications. |
| 24 | Tiered referral rewards | MISSING | LOW | `public/thanks.html:3`; `google-apps-script/Code.gs:18`; `package.json:7` | No reward tiers, qualification rules, ledger or fulfilment. Do not imply a promised programme. |
| 25 | Optional post-capture research question | MISSING | MEDIUM | `public/site.js:55`; `public/thanks.html:3`; `google-apps-script/Code.gs:18` | No post-signup willingness-to-pay or problem research. Keep optional and after confirmed capture; health answers require particular privacy care. |
| 26 | Mobile performance | PARTIAL | HIGH | `public/index.html:3`; `public/site.js:85`, `:137`; `public/styles.css:1`, `:48`, `:195` | Static/deferred JS, WebP and local fonts are positives; no next/image because no Next. Initial mobile loads 4.50MB ingredient video; large PNG/wordmark; no responsive srcset; font/hero shift. Lab metrics below. |
| 27 | Analytics/ad pixel/events/UTM | MISSING | HIGH | `public/index.html:3`; `public/site.js:48`, `:50`; `package.json:7` | No analytics/pixel/event implementation or UTM capture. All five requested funnel events absent. No production host-injected analytics can be ruled out; that is UNVERIFIED. A pixel is optional, not inherently required for validation. |
| 28 | Greek privacy/consent/cookies/contact/unsubscribe | PARTIAL | HIGH | `public/privacy.html:3`; `public/index.html:3`, `.consent`; `README.md:40`, `:56` | Policy, explicit consent, contact and withdrawal by email exist. Retention wording lacks a clear schedule/criteria beyond active consent; full address, actual processor/transfer arrangements and operational deletion/suppression are unverified. No banner is necessary for the currently observed tracker-free browser; future non-essential scripts must be consent-gated. |
| 29 | SEO/sharing metadata | PARTIAL | MEDIUM | `public/index.html:3`; `scripts/build.mjs:17`, `:24`, `:25` | Greek lang/title/description/favicon/OG basics exist and build adds OG image/canonicals. Relative hreflang URLs fail the local Lighthouse check and build does not absolutise them. Production canonical origin, redirects, OG image fetching and indexing are UNVERIFIED. |
| 30 | Accessibility basics | PARTIAL | HIGH | `public/index.html:3`; `public/styles.css:4`, `:48`, `:153`, `:243`, `:246`; `public/site.js:26`, `:175` | Labels, alt text, focus and manual/reduced-motion controls present. EN link is 30×44px mobile / 38×44px desktop; desktop Blog ~34×47px. Privacy inline link is ~121×17px; consent label ~335×42px on mobile. These do not meet the requested universal 44px rule. EN accessible name fails Lighthouse label-in-name check. Hero heading hierarchy is visually weak at ~17px. |
| 31 | Security: secrets/env/headers | UNVERIFIED | HIGH | `.gitignore:2`; `.env.example:2`; `netlify/functions/waitlist.mjs:31`; `netlify.toml:15`; `scripts/serve.mjs:17` | Source protections exist and no production secret literal was identified in inspected current files (test fixtures use labelled test secrets). Live Netlify headers, repository-history secret exposure, Google Sheet sharing and hosting env separation cannot be verified here. Local dev only sets a subset of configured production headers; that alone is not a production defect. |

## Validation evidence and limits

### Existing commands

- `npm test`: **13 passed, 0 failed, 0 skipped**, current audit run; includes validation, case-insensitive duplicate/receiver mocks, confirmed-storage semantics, file-preview links, bilingual parity and native redirects. Relevant commands: `package.json:10`. These are unit/static tests, not a live Google or Supabase integration test.
- `OUTPUT_DIR=/tmp/primal-core-audit-build npm run build`: **passed**. This invokes the existing build with its supported output override (`scripts/build.mjs:3`) and leaves project build outputs untouched. Build has no type-check stage.
- Lint: **not available**; no lint script/config/dependency found in the inspected project (`package.json:7`). Not reported as a passing lint run.
- Typecheck: **not available**; no typecheck script, TypeScript manifest/config or typed framework app found (`package.json:5`, `:7`). Not reported as a passing type check.
- `GOOGLE_APPS_SCRIPT_URL` and `WAITLIST_SHARED_SECRET`: **unset in this cloud process**. Only names/presence were checked, never values. Actual local POST from the Greek form returned HTTP 503, `{"ok":false,"error":"not_configured"}`. Error UI retained `audit@example.com`; no remote signup was attempted. Deployed settings remain UNVERIFIED.
- Local mock response `{ok:true}`: verified button disabled/`aria-busy=true`/Greek loading, then Greek success and cleared form. The response was browser-intercepted; **no persistence or welcome email was exercised**.
- No JS errors and no horizontal overflow in the audited initial homepage viewports. Three initial-load checks observed only same-origin browser requests. This is bounded evidence, not an all-pages/all-states guarantee.

### Above-the-fold checks

Chromium 156 headless; normal motion; Greek homepage; fonts and hero poster decoded; scroll position zero. Coordinates are CSS pixels after fonts settled, not during the measured layout shift.

| Viewport | Headline | Email field | Submit button | Consent block | Main product figure |
| --- | --- | --- | --- | --- | --- |
| 375×812 | y291–328; 16.875px type | y369–429 | y429–483 | y504–545 | begins y2443 |
| 375×667 | y218–255; 16.875px type | y296–356 | y356–410 | y431–473 | begins y2298 |
| 1440×1000 | y367–496; 60.48px type | y553–613 | y553–613 | y634–657 | begins y4716 |

The hero shows a **closed tin**, background resin/berries and no visible open balm texture in these initial views. A desktop scroll can reveal different film frames; the mobile hero intentionally stays on its poster (`public/site.js:69`, `:84`). Opening the tin later in a film would not satisfy a no-scroll first-screen requirement. Product-photo ownership and the identity of “five supplied tin photos” remain UNVERIFIED; verify against the owner's original files, not alt text or filenames. Generated marble/bottle provenance is explicitly declared at `public/assets/philosophy/provenance.json:4`, `:11`; those are artistic assets, not evidence of a founder or historical individual.

### Local Lighthouse — one mobile lab run

Command used from `/tmp` (package cache outside project):

```sh
npx --yes --cache /tmp/primal-audit-npm lighthouse http://127.0.0.1:8080/ \
  --chrome-path=/usr/bin/chromium --chrome-flags='--headless --no-sandbox' \
  --only-categories=performance,accessibility,seo \
  --output=json --output-path=/tmp/primal-core-lighthouse.json --quiet
```

Lighthouse **13.6.0**, recorded **15 Nov 2026 at 10:10 Athens / 08:10 UTC**; emulated 412×823 mobile, simulated network (150ms RTT, ~1.6Mbps) and 4× CPU slowdown, local development server. This is separate from the required 375px manual/browser checks. No production CDN, real mobile device, field data or deployed security headers were measured.

| Metric | Observed |
| --- | --- |
| Performance | 74/100 |
| Accessibility category | 100/100, **not full accessibility compliance** |
| SEO | 91/100 |
| First Contentful Paint | 1.1s |
| Largest Contentful Paint | 3.9s |
| Total Blocking Time | 32ms (display rounded to 30ms) |
| Cumulative Layout Shift | 0.2797 (display 0.28) |
| Total transfer | 6,884,017 bytes (~6.57 MiB) |

Lighthouse identifies a font-associated layout shift in `.hero-shade`, rather than proving a single root cause. Investigate fallback font metrics, hero centring, form size and late slider measurement together (`public/styles.css:1`, `:195`; `public/site.js:162`). The below-fold ingredient video transfers ~4.50MB; metadata preload does not guarantee a tiny download, and the observed resource is large even before user scroll. The main product PNG is 1,797,791 bytes, resin PNG 1,990,389 bytes, wordmark JPG 210,587 bytes; code provides width/height but no responsive alternatives (`public/index.html:3`; `public/blog/chios-mastic-skincare.html:3`). No need to migrate to Next just to optimise media.

Other measured findings: relative hreflang links are flagged; the EN link's visible label does not match its accessible name under the automated label-in-name test; contrast audit has no failing elements in this run. The accessible-name finding is present **despite** the 100 category score; do not suppress it or equate the score with WCAG certification. Compression and no-store warnings apply to the development server (`scripts/serve.mjs:17`), so production compression/cache behaviour is UNVERIFIED. No repeated Lighthouse runs were used to select a better score.

Temporary evidence: `/tmp/primal-audit-browser.json`, `/tmp/primal-core-lighthouse.json`, `/tmp/primal-audit-375x812.png`, `/tmp/primal-audit-375x667.png`, `/tmp/primal-audit-1440x1000.png`. These are local audit artefacts, not guaranteed downloadable attachments.

### Interface audit lens (limited, not a compliance certificate)

Using the Impeccable audit framework: Accessibility **2/4**, Performance **2/4**, Responsive **3/4**, Theming **3/4**, Implementation integrity **2/4**; **12/20 — significant work remains**. These are qualitative code-review ratings, separate from Lighthouse's numeric scores. No design detector result is claimed: the session's context launcher was unavailable, and installing/modifying project tooling would violate this task's read-only restriction. Product-specific visual identity, spacing tokens, local fonts, native details, reduced-motion controls and honest error handling are positives (`DESIGN.md:3`; `public/styles.css:3`, `:153`; `public/site.js:113`). Claim integrity and inconsistent formulation truth fail the integrity review even though the interface itself is coherent. No light-theme requirement is invented for this intentionally dark brand.

## Claims review — complete homepage claim inventory

All quotations in this subsection are current Greek homepage copy, **not replacement copy** (`public/index.html:3`). English counterparts at `public/en/index.html:3` need simultaneous review. “Evidence needed” means final-formula/suitable ingredient substantiation and approved wording, not a claim that the ingredient can never have the property. Historical use or an ingredient study alone is not evidence of the finished product's effects (`PRODUCT.md:35`).

| Block | Current claim(s) | Evidence / risk |
| --- | --- | --- |
| Hero | “Θέλεις να δεις το πρόσωπό σου απαλό και ενυδατωμένο;” | Outcome-led question implies a benefit in this product context. Substantiate the eventual moisturising/softening promise; currently no final-formula data supplied. |
| Benefit 1 | “Λιγότερο ορατές γραμμές αφυδάτωσης”; “Βοηθά στη μείωση της όψης των λεπτών γραμμών που προκαλούνται από την ξηρότητα.” | Finished-product evidence needed for visible fine-line improvement. Do not equate temporary hydration effects with wrinkle removal. |
| Benefit 2 | “Εντατική ενυδάτωση”; “Ανακουφίζει την ξηρή επιδερμίδα και σχηματίζει προστατευτικό λιπιδικό φραγμό.” | Hydration/protection/comfort claims need appropriate support. “Intensive” also requires a defensible interpretation. |
| Benefit 3 | “Λεία & ξεκούραστη όψη”; “Αφήνει την επιφάνεια του δέρματος απαλή και λεία, με ματ, μη λιπαρό τελείωμα.” | Smoothness/rested appearance and matte/non-greasy finish need formula/user evidence; sensory properties are not fixed. |
| Tallow slide | “θρέφει εντατικά”; “επανορθώνει τον δερματικό φραγμό”; “βαθιά ενυδάτωση”; fatty acids/vitamins “μοιάζουν με τα φυσικά λιπίδια της επιδερμίδας” | Repair/depth and lipid similarity can overstate relevance or efficacy. Verify actual composition and finished-product effects; “similar” is not “identical” or automatic compatibility. |
| Mastic slide | “ισχυρή αντιοξειδωτική και αντιβακτηριακή προστασία”; “καταπραΰνει τις κοκκινίλες”; “ανάπλαση και … σύσφιξη”; “υγιή όψη και φυσική λάμψη” | Highest-risk cluster: strong antibacterial/protection, redness, regeneration and firming require substantiation and review of cosmetic/medicinal implications. Mastic is not certain to be in the final formula. |
| Beeswax slide | “προστατευτικό φιλμ”; “κλειδώνει την υγρασία”; “καταπραΰνει τους ερεθισμούς”; “απαλό και ενυδατωμένο” | Film/moisture support may be reasonable ingredient functions but product efficacy and irritation-soothing must not be assumed. |
| Jojoba slide | “ενυδατώνει σε βάθος”; “ρυθμίζει τη λιπαρότητα”; “μιμούμενο το φυσικό σμήγμα”; “χωρίς να φράζει τους πόρους” | Depth, sebum regulation and non-comedogenic certainty require support; presence is option-dependent. |
| Vitamin E slide | “προστατεύει … από τις ελεύθερες ρίζες και την πρόωρη γήρανση”; “ενισχύοντας τον δερματικό φραγμό”; “κλειδώνοντας την υγρασία”; “απαλό και ελαστικό δέρμα” | Antioxidant ingredient function does not automatically prove prevention of premature skin ageing or barrier strengthening by the product. |
| Use FAQ | Warm a small amount; morning/evening; spreads easily when warmed; use advice for very dry skin | Directions and texture/spreadability depend on the final safety assessment and intended use. External-only/eye/irritation cautions are useful, but do not themselves validate the directions. |
| Dry-skin FAQ | “Ναι, φτιάχτηκε για ξηρό / ταλαιπωρημένο δέρμα”; “μείωση … ξηρότητας και λεπτών γραμμών”; combination-skin use “ώστε να μην βαραίνει τις λιπαρές ζώνες” | Conflicts with the earlier FAQ saying suitability is unconfirmed. Dry-skin suitability and fine-line effects need support; avoiding heaviness is sensory/formula-dependent. |
| Jar-duration FAQ | “50ml”; “αρκετές εβδομάδες”; “λίγη ποσότητα αρκεί”; “απλώνεται εύκολα” | Size, dosing, duration and ease of spread are not verified product facts. Confirm size/usage study and label instructions. |
| Scent FAQ | “Η Μαστίχα Χίου δίνει την κύρια αρωματική υπογραφή — μια καθαρή, δροσερή, ρητινώδη και ελαφρώς ξυλώδη μυρωδιά.” | Option B only if mastic is selected; scent profile requires actual prototype verification. Do not imply Option A contains mastic. |
| Metadata and media | Description calls it a men's beef-tallow face balm; “5 συστατικά μόνο. Τίποτε άλλο”; ingredient-video label says five; individual slides give a fixed formula; product caption says development visual/final package may differ | Ingredient identity/count/development status must stay aligned. Disclaimers are useful but do not cure definitive contradictory claims. Packaging artwork and video may carry further visible text; final artwork verification is still required. |

No homepage testimonials, customer totals, clinical-result percentages, endorsement/certification logos, fake queue positions or countdowns were found. “15% έκπτωση” is an incentive, not measured efficacy or a signup count; its terms remain unverified. The brand wordmark is not a certification. A fictional marble image is not an identified founder or historical portrait.

### Linked-page risk that can undermine the landing page

`public/blog/hippocrates-tallow-mastic.html:3` and `public/en/blog/hippocrates-tallow-mastic.html:3` make materially stronger statements than the cautious development disclosures: nearly identical lipid profile to human sebum; vitamin richness; revival of ancient know-how; immediate soothing after shaving; restoring the barrier after sun; deep nourishment; absorption without greasiness; ancient techniques described as scientifically documented; EMA references used beside product claims. These require source-level historical/scientific verification and finished-product/legal review. **Do not call them fabricated on the present evidence, but do not treat bibliographic names as proof.** See also historical healing/regeneration statements in `public/philosophy.html:6` / `public/en/philosophy.html:6`. The wider articles often correctly distinguish ingredient studies from clinical product efficacy; retain that distinction. The claim catalogue above is exhaustive for the homepage, not a declaration that every medical/historical statement in all eight articles has been scientifically fact-checked.

### Formula decisions: unresolved, no formula selected

Owner's current brief: Option A = grass-fed beef tallow + pure beeswax + sea buckthorn + vitamin E + jojoba oil; Option B substitutes mastic oil for jojoba. **Both options are unfinalised.** The current homepage names tallow + mastic oil + beeswax + jojoba + vitamin E (`public/index.html:3`), and `PRODUCT.md:19` records that older combination. It includes both alternatives and omits sea buckthorn from its named list. Do not silently choose an option, claim grass-fed sourcing, add sea buckthorn or lock a count. The five-ingredient count happens to match the two proposed options numerically, but is still a premature final-product assertion; that is different from saying five is mathematically inconsistent with the options. The current hero's berries are a visual ingredient cue, not proof of a final composition.

Every current HTML text/metadata/alt/ARIA occurrence naming ingredients, counts or sensory properties is indexed in Appendix A, including all English equivalents. Non-HTML sources of formula truth that also need a future coordinated review:

| Location | Current assertion / dependency |
| --- | --- |
| `PRODUCT.md:15`, `:19`, `:31`, `:35` | 15% offer; exact five-ingredient older formula; supplied-asset/ingredient-copy assumptions. |
| `DESIGN.md:5`, `:27`, `:35` | Owner-copy/ingredient-slider requirements and the five-ingredient presentation; preserve layout preferences while updating approved product truth. |
| `README.md:3`, `:57`, `:58` | Brand description, imagery/packaging accuracy and claim-evidence limitations. |
| `COPY-PROPOSAL.md:1` (whole document) | Draft copy, not customer-facing authority; review before any reuse. |
| `REVIEW.md:1` (whole document) | Earlier review/handoff, not proof of current formula or deployment; avoid reusing historical completion claims as current evidence. |
| `public/site.js:150`, `:159`, `:160` | Slide count is computed from actual slide nodes; not a separate hardcoded formula, but must be tested if count/content changes. |
| `public/index.html:3`, `public/en/index.html:3` | Film aria label, slides, alt text, product caption, FAQ, headline and metadata carry formula/sensory wording. |
| `public/assets/tallow-mastic-balm.png` and referenced hero/ingredient films/posters | Embedded labels/ingredient visuals cannot be fully audited by text search. Require original-artwork and frame-by-frame owner verification. Binary assets have no meaningful source line number; HTML uses are cited in Appendix A. |

## 2. Top 10 fixes, ranked by risk/conversion relative to effort

Scores are **planning estimates**, not measured uplifts: C = conversion consequence (1–5), L = legal/data consequence (1–5), E = effort units S=1/M=2/L=4; priority index = (C+L)/E. Ties put traffic blockers first. Optional referral features are deliberately not elevated above capture correctness.

| Rank | Fix | C | L | Effort | Index | Why first / dependencies |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Validate and configure one real capture backend; pause traffic until a real save/duplicate test passes | 5 | 5 | S for current Google configuration; L if Supabase replacement | 10 for configuration path | Local capture is blocked. First confirm correct repo and intended backend; do not create a Supabase migration merely to hide the discrepancy. Items 17/31. |
| 2 | Quarantine unsupported definitive efficacy/formula/sensory claims across Greek/English landing and highest-risk linked content | 5 | 5 | S for interim wording; M/L for evidence work | 10 for interim copy | Correct immediately after owner review; do not wait for laboratory work or pick an ingredient option. Items 11/13. |
| 3 | Complete privacy/withdrawal/retention operations and immutable consent wording/version evidence | 4 | 5 | M | 4.5 | Consent UI already exists; close operational gaps before traffic or mailing. Items 19/28/31. |
| 4 | Repair first-screen hierarchy and show a verified open-tin texture photo with truthful subheadline | 5 | 3 | M | 4 | Current mobile hero is ~17px and closed-tin-only; requires original asset verification. Items 1/2/9. |
| 5 | Add minimal consent-aware funnel measurement and allowlisted campaign attribution | 5 | 3 | M | 4 | Demand cannot be quantified well without counts/attribution. No email/health data in analytics. Items 19/27/28. |
| 6 | Clarify the existing incentive and honest update cadence at both forms and after signup | 4 | 3 | M | 3.5 | Needs offer/timing decisions; avoid false urgency. Items 10/21. |
| 7 | Reduce initial media payload and stabilise font/hero layout | 5 | 2 | M | 3.5 | Lab 3.9s LCP/0.28 CLS; optimise without replacing architecture. Item 26. |
| 8 | Add a short recognition section and a focused non-greasy FAQ answer only when supportable | 4 | 2 | M | 3 | Fits qualified-signup goal; tied to claim review. Items 7/11. |
| 9 | Fix 44px targets, language accessible name and generated absolute hreflang | 3 | 3 | M | 3 | Small shared changes affect both languages/all pages. Items 29/30. |
| 10 | Add reliable welcome/next-step email plus unsubscribe/suppression, after storage succeeds | 3 | 3 | M | 3 | Provider/domain/authentication and operational owner needed; do not delay persistence response on email. Items 20/21/28. |

Additional before scaling paid traffic: rate-limit the public endpoint and monitor quota/storage failures. The minimal honeypot earns item 18 a PASS, but is not robust paid-traffic protection. Proposed rate-limit storage/vendor and caps need approval; do not invent a ready-made configured service.

## 3. Accommodation plans for every MISSING or PARTIAL item

Plans describe possible future work only. Greek wording below is **draft report-only wording**, not an edit or a product fact. For every frontend change, mirror the English route, preserve native/no-JS reading, reduced-motion and consent semantics, and test at 375×667, 375×812 and desktop.

### 1 — Headline and subheadline (PARTIAL)

- Change `public/index.html:3` (`#hero-title`/hero copy), `public/en/index.html:3`, and conflicting hero size rules at `public/styles.css:30`, `:48`, `:195`. Use one scoped readable mobile type rule and add a truthful product/development explanation.
- Draft for review: “Αναπτύσσουμε ένα ανδρικό βάλσαμο προσώπου με βάση το βόειο στέαρ. Μπες στη λίστα για νέα σχετικά με την εξέλιξη και την κυκλοφορία του.” Do not imply proven effects or final ingredients.
- Fits static architecture; no route, DB, SQL, env or dependency needed. **S**. Risk: taller content can push the form below fold; depends on approved copy and item 2.
- Test: exact copy parity, no overflow/overlap at 200% zoom and 375px; email, CTA, consent stay visible at both mobile heights; no-JS remains readable.

### 2 — Real texture image and five-photo verification (PARTIAL)

- Owner supplies/identifies all five original tin photos and rights/usage status. Map originals to `public/assets/` files and intended slots, including development packaging status. This cannot be inferred from existing generated imagery or filenames.
- After approval, change hero media in `public/index.html:3` and English mirror, with responsive WebP/AVIF derivatives and an open-balm crop visible above fold. Keep film/reduced-motion poster behaviour unless the owner approves changing it. Related selectors: `public/styles.css:5`, `:157`; loading logic `public/site.js:67`.
- Static asset/layout change; no DB/SQL/new env; optional image processing at build time, not a required framework migration. **M**. Risks: wrong packaging/formula visible in photos, excessive image payload, over-dark overlays. Depends on owner originals and item 13.
- Test: compare each original/hash to the approved manifest; inspect texture and label at 375px without scrolling, with JS disabled/reduced motion; check dimensions, transfer sizes and contrast. Five distinct verified assets must be mapped if using all five remains a requirement.

### 6 — Focused signup route without removing the shared site navigation (PARTIAL)

- Propose a separate `public/waitlist.html` and `public/en/waitlist.html` campaign landing page, using shared form mechanics and a scoped layout in `public/styles.css`. Omit marketing menu/social exits on this route, while preserving the existing site's owner-specified menu. Keep privacy/contact access; language may be selected in the campaign URL rather than another pre-signup exit.
- No DB/SQL/env/dependency for layout; a new static route and build inclusion are needed. **M**. Risk: duplicated copy/form drift and experiment pollution; depends on items 1/13/27 and owner's choice between a focused route and homepage changes.
- Test: direct campaign URLs at 375px; only necessary privacy links before capture, correct language, all validations/states, no-JS form submission; campaign/source attribution identifies this route.

### 7 — Recognition section (MISSING)

- Add a short text section in `public/index.html:3` and `public/en/index.html:3` between hero and benefits, or on the approved focused route. Reuse existing spacing tokens rather than new card decoration.
- Draft question for review: “Νιώθεις το δέρμα σου να τραβάει μετά το πλύσιμο;” This recognises a situation; it must not claim a tested PRIMAL CORE treatment. Avoid diagnosing eczema/acne or implying universal suitability.
- Static content only; no SQL/DB/env/dependency. **S**. Depends on claim review and the selected landing surface; risk: length distracts before capture.
- Test: quick comprehension with target Greek-speaking men, section readable at 375px, signup still above fold, no unapproved product-benefit claims introduced.

### 9 — Trust and provenance (PARTIAL)

- Add concise development transparency and verified original photos on the landing surface; link to or briefly summarise the genuine story in `public/about.html:5` and English mirror. Add founder name/face only if supplied and approved. Maintain clear artistic attribution for generated images; do not use them as historic/founder proof.
- Files: `public/index.html:3`, English mirror; `public/about.html:5`, `public/en/about.html:5`; owner-approved assets under `public/assets/`; optionally `PRODUCT.md:31`/`DESIGN.md` after decisions. No DB/SQL/env/dependency. **M**.
- Risks: testimonial/identity/rights invention and exposing an unapproved prototype; depends on items 2/13. Test mobile transparency/caption visibility, verify rights and identity with owner, and check no implied certification or clinical result.

### 10 — Incentive and cadence (PARTIAL)

- Confirm whether the existing 15% launch discount will be honoured; define eligibility, redemption, exclusions and expiry only if real. Otherwise withdraw the promise after approval. No new urgency or date may be invented.
- Reflect approved terms consistently in `public/index.html:3`, `public/en/index.html:3`, status-page counterparts and eventual welcome template; clarify a realistic update cadence/next milestone. If terms require a new static page, propose `public/early-access-terms.html` and English mirror.
- Static text initially; if codes/eligibility need enforcement, add backend-only offer version/eligibility fields via SQL-B below, or Sheets columns. No new env/dependency until fulfilment chosen. **S–M**.
- Risks: binding/false offer, discount leakage or an impossible update promise. Dependencies: owner terms, item 20 for delivery. Test both forms, mobile/no-JS and thank-you show the same offer; no countdown unless demonstrably backed by real scheduling.

### 11 — Short, supportable FAQ (PARTIAL)

- Review the seven current `#faq` details at `public/index.html:3` and English mirror; consolidate to grease, use, suitability and availability; retain native details and generous spacing (`public/styles.css:199`). Remove conflicts between unconfirmed suitability and definitive dry-skin/texture claims.
- Draft pending final-formula testing: “Η τελική υφή και η αίσθηση εφαρμογής αξιολογούνται ακόμη. Θα δημοσιεύσουμε τις οριστικές πληροφορίες πριν από την κυκλοφορία.” Do not substitute “never greasy” or confirmed application advice without evidence.
- No DB/SQL/env/new dependency. **S**. Depends on item 13 and owner formula/safety review.
- Test each answer on 375px, keyboard, expanded/collapsed; no unsupported suitability or scent claim; signup column remains stable when answers expand.

### 13 — Claim/formula truth and evidence (PARTIAL)

- Use the homepage claim table and Appendix A as the review list. Files: Greek/English landing, philosophy/about and all eight blog pairs, relevant media/metadata, then `PRODUCT.md:19`, `DESIGN.md`, `README.md:57`, and any reused draft copy.
- Owner/regulatory reviewer either supplies claim-specific final-formula evidence or approves removing/qualifying the assertion. Quarantine medical-sounding repair/antibacterial/regeneration language first. Preserve development status; ingredient facts must not masquerade as clinical results. Resolve the Options A/B mismatch only after a formula decision.
- Static text/media changes; no DB/SQL/env/dependency. Interim cleanup **S**, full evidence/artwork review **M/L**. Risks: outdated embedded packaging/video text and English divergence; dependencies: formula, testing and asset provenance.
- Test: reviewed claim register with evidence owner/version for every approved benefit; search all HTML/meta/alt/video labels and English equivalents; manually review media frames; at 375px ensure disclaimers are legible and proximate. This report does not itself establish regulatory approval.

### 17 — Correct storage architecture and validate real persistence (MISSING)

- First confirm the target deployment/repository and backend. **Path A, current architecture:** deploy/verify the supplied Apps Script, restrict Sheet sharing, configure server-side endpoint/secret and script properties through secure settings; run controlled save/duplicate/concurrency/failure checks. No application rewrite or SQL is necessary for this path. Configuration is **S**; live permission resolution may be external.
- **Path B, if Supabase is required:** retain static pages and replace only the storage adapter inside `netlify/functions/waitlist.mjs:33`; add a reviewed migration such as `supabase/migrations/<timestamp>_waitlist.sql` implementing SQL-A below. Use a server-only Supabase client or service REST call; no public anon direct insert/read path. Update `.env.example`, tests, `README.md` and `public/privacy.html` plus English mirror to describe actual processors. A full Next migration is not required. **L** including migration/testing.
- New envs for Path B: server-only `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`; optional dedicated pseudonymous rate-limit key. Do not expose these via `NEXT_PUBLIC_*`, HTML or JS. If a Supabase SDK is chosen, that is a new declared dependency and lockfile; native server fetch can avoid it. No values belong in the report/chat.
- Risk: lost/duplicated records, publicly readable emails, non-atomic writes and processor/transfer changes. Inventory/export existing production Sheets data securely before migration, with a reconciliation and rollback plan; no existing data was inspected here. Depends on item 28 and owner backend decision.
- Tests: real insert, mixed-case and simultaneous duplicates, durable row after response/restart, receipt timestamps, malformed/oversize/bot/origin errors, backend timeout, no false UI success. On Supabase, direct anon/authenticated SELECT/INSERT/UPDATE/DELETE must fail and no emails/counts are exposed. Verify from an actual browser at 375px and native no-JS POST. Do not send welcome/test mail without an approved controlled address.

### 19 — Consent evidence and minimal attribution (PARTIAL)

- Add allowlisted `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, a bounded source/landing route, referral origin (not an unfiltered URL), locale, server receipt/consent timestamps and a version referring to the exact consent wording. A privacy-policy version alone is not the consent-text version.
- Files: `public/site.js:50`, both forms/native hidden fields in Greek/English pages, `netlify/functions/waitlist.mjs:18`, `:36`; `google-apps-script/Code.gs:18`, `:29` if Sheets, or SQL-A/SQL-B if Supabase; privacy/README and tests. Scope attribution in memory/hidden fields for a single navigation; do not silently introduce persistent tracking without reviewing consent requirements.
- Sheets schema/receiver change or SQL-A; no analytics SDK is necessary just to save campaign tags. Native form handling must also validate/bound these fields server-side. **M**.
- Risk: UTM/referrer may contain email/PII, tampering and inconsistent consent versions. Store only needed allowlisted fields; strip referrer queries/fragments and validate origin. Duplicate requests must not silently renew consent. Depends on items 17/28.
- Test: malicious/long query params, Greek characters, no referrer, native submissions, accurate consent wording/version/locale, UTC receipt times and duplicate idempotency; use a 375px campaign URL and inspect a controlled row.

### 20 — Welcome email (MISSING)

- Select provider, sender identity, domain authentication and operational owner; approve Greek/English templates and frequency. Add an email outbox only after durable signup; send asynchronously with retries/idempotency, never blocking the capture response or claiming delivery on a failed send.
- Files proposed: existing `netlify/functions/waitlist.mjs` storage transaction; new `netlify/functions/waitlist-mail-worker.mjs`; provider adapter `netlify/lib/waitlist-mail.mjs`; reviewed templates under `netlify/templates/`; `netlify.toml` schedule/queue configuration; privacy, `.env.example`, README and tests. A Sheets path needs an equivalent durable outbox/worker, not a brittle inline email call. Confirm the host supports the chosen schedule/queue.
- New envs only after provider choice: e.g. `EMAIL_API_KEY`, `EMAIL_FROM`, `PUBLIC_SITE_URL`, `UNSUBSCRIBE_TOKEN_SECRET`; optional verified-email token key. Provider SDK optional; SQL-C adds outbox for Supabase. **M/L**.
- Risks: duplicate sends, bounce/reputation, deliverability vs API acceptance, unsubscribe failure, unwanted re-enrolment. Depends on items 17/19/28. Do not assume double opt-in is legally mandatory in every case; choose it for list quality/confirmation with the owner.
- Test sandbox provider, idempotent retry, durable capture during provider outage, 375px email rendering, both locales, working unsubscribe and no email on failed saves; real controlled delivery and DNS remain external checks.

### 21 — Thank-you and expectation (PARTIAL)

- Enhance Greek success text at `public/site.js:55`, English message mapping `:7`, `public/thanks.html:3` and English mirror with approved next step/cadence, offer conditions and optional next action. Keep confirmation conditional on durable storage.
- Static copy initially; no SQL/env/new dependency unless enabling the optional features below. **S**. Depends on items 10/17/20; do not say “check your inbox” until email sending exists.
- Test actual save and failures, mocked sender failures, duplicate requests, native redirects, directly opened static status page and 375px/no-JS reading. A direct status URL must not act as a credential for private subscriber data.

### 22 — Queue position (MISSING; optional)

- Ask whether a queue has real meaning. If not, do not add one merely to tick a checklist. If approved, add a server-issued immutable join sequence and define honest semantics: original join number vs current active rank; never label one as the other.
- Files: storage adapter, response shaping in `netlify/functions/waitlist.mjs:8`, inline/static thank-you UI and English mirrors; a new authenticated result endpoint only if revisiting status is required. SQL-A provides an internal sequence; compute any public display server-side. No anonymous global counts/read policy.
- New schema/route; private signed opaque status tokens with short expiry need a server-only signing key if subscriber-specific status is persisted. **M**. Risks: membership enumeration, leaking subscriber count or implying priority that cannot be honoured. Depends on item 17 and a confirmed queue policy.
- Test simultaneous inserts/duplicates/deletions, no email-based status lookup, no predictable-ID access, honest rank wording; 375px success state remains concise. SQL is in SQL-A; no implementation applied.

### 23 — Referral tracking (MISSING; optional)

- Add an opaque random referral code only after capture/verification; pass `?ref=` through a bounded hidden field, validate server-side, prohibit self-referral and credit once only after the owner-defined valid referral milestone. A code is not an authorisation token for private data.
- Files: Greek/English success UI, shared `public/site.js`, signup handler; optional `netlify/functions/waitlist-status.mjs` protected by signed session/status tokens. SQL-D below, with private RLS tables. Add no public subscriber lookup.
- Schema + optional route + status signing key; no frontend referral vendor required. **L**. Risks: fake addresses, cookie/attribution consent, code theft, email enumeration. Depends on items 17/19/20/28; prefer verified referrals if rewards have value.
- Test two controlled signups, invalid/self/cyclic/replayed referral codes, concurrency, deletion and withdrawal, no raw emails, and 375px link copying/fallback. Never reward an unverified or failed save.

### 24 — Tiered rewards (MISSING; optional)

- Owner supplies real tiers, fulfilment, stock/price constraints, eligibility, expiry and terms. Do not write “3 friends = free product” without an approved programme.
- Files: future reward/status UI in inline and static thank-you pages (both languages), private referral/reward service and worker, terms page and tests. SQL-D defines versioned tier/award ledgers; there is no seed data because no tiers are approved.
- Schema + fulfilment integration; new env/dependency only if the chosen provider needs one. **L**. Risks: fraudulent qualifying signups, overspend, liability/terms, disputes and duplicate fulfilment. Depends on items 20/23/28 and owner commercial rules.
- Test thresholds, one award per qualified tier, rollback/suppression, race conditions and retry-safe fulfilment; mobile progress must use genuine counts and clarify terms. Optional, after reliable core acquisition.

### 25 — Post-capture research (MISSING)

- After confirmed signup, offer an explicitly skippable price-band question (bands/currency selected by owner); prefer broad non-medical “what matters most in skincare?” options over asking diagnoses. Do not collect free-text health data or detailed skin-condition data without a separately justified sensitive-data/privacy process.
- Files: success UI in `public/site.js:55`, Greek/English status pages; proposed `netlify/functions/waitlist-survey.mjs`; privacy text/tests. SQL-E below. Require an opaque signed proof of capture; a posted email or subscriber UUID alone is insufficient. Native redirects need a protected post-capture session or a signed email link; never put email/PII in URLs.
- New schema/endpoint + server-only signing key; no survey SDK necessary. **M**. Risks: sensitive data, biased sampling, pre-signup friction and token leaks. Depends on items 17/19/28.
- Test skip does not alter capture, failure does not lose signup, replay/expiry/ownership, bounded valid answers and deletion; 375px optional controls and completion state.

### 26 — Performance (PARTIAL)

- Files: media markup in Greek/English pages, `public/styles.css:1`, `:48`, `:195`; `public/site.js:85`, `:137`, `:162`; build/media derivatives and caching in `netlify.toml:20`. Serve responsive modern product/resin/wordmark images, limit priority to real above-fold assets, and investigate fallback font metrics/hero sizing to reduce shift.
- Defer ingredient media network attachment until encounter instead of relying on preload metadata/autoplay; retain manual pause, muted loop, reduced-motion/manual and no-JS fallback requirements. Keep the owner's desktop scroll-seeking hero unless separately approved. Audit property read/write loops before changing motion.
- Fits static architecture; no SQL/env/new runtime dependency required. Optional build-time image tooling is a separate dependency decision. **M**. Risk: poorer imagery or broken media/no-JS accessibility. Dependencies: item 2; verify on production CDN before changing headers based on local warnings.
- Test cold mobile/throttled network and field RUM when available; target LCP ≤2.5s and CLS ≤0.1 as goals, not promises. At 375px ensure stable first-screen form while fonts/videos load, and verify no offscreen 4.5MB download before encounter. Compare before/after assets and functional film controls.

### 27 — Analytics and events (MISSING)

- Choose a minimal measurement provider and define qualified signup. Start with aggregate server-side durable-signup counts; add `page_view`, `cta_click`, `form_start` (once per form), `form_error` (coarse code), `signup_success` (after confirmed durable save) as needed. Duplicate retries must not inflate unique-signup counts. Avoid a pixel unless the campaign needs it.
- Files: `public/site.js` event hooks, Greek/English consent UI if required, `netlify/functions/waitlist.mjs` authoritative outcome, new small analytics adapter, `public/privacy.html` and mirror, Netlify CSP/endpoint settings and tests. Attribution schema: item 19 / SQL-A. Provider keys/endpoints only after selection; secret ingestion keys stay server-side.
- New integration/dependency optional; schema only for retained attribution/event definitions; **M**. Risks: consent bypass, PII leaks, advertising identifiers and counting client success instead of saves. Depend on items 17/19/28. Do not send emails, raw referral tokens or research answers to analytics; no blanket claim that every “cookieless” tool is consent-exempt.
- Test blocked scripts before acceptance where consent is needed, reject/withdraw, no tracking on failure or file-preview fake success, once-only events, both forms/locales/375px, UTM sanitisation and server reconciliation.

### 28 — Privacy and withdrawal (PARTIAL)

- Update `public/privacy.html:3` and English mirror to the real controller address, storage/email/analytics processors, purpose, retention criteria/schedule, rights and transfers after owner confirmation. Keep unchecked linked consent in forms; version exact consent text alongside privacy policy (item 19).
- Define monitored-mailbox withdrawal/deletion now; implement an unsubscribe/suppression endpoint before sending emails. Proposed `netlify/functions/waitlist-unsubscribe.mjs` takes an opaque signed token; server tracks withdrawal and suppresses future sends, with an idempotent confirmation. Do not log email-bearing links/tokens. Keep necessary suppression evidence according to an approved retention policy. SQL-A provides `withdrawn_at`; provider/worker suppression checks are still required.
- No cookie banner just to add a banner to the current observed tracker-free site. If item 27 introduces consent-requiring scripts, add a genuine prior-consent loader (including pixels/cookies) and update CSP. A banner alone is not blocking.
- Schema/process changes + optional endpoint; new signing secret/email provider as item 20; no mandated dependency. **M**. Risks: inconsistent copies, unactioned withdrawal and sensitive survey data. Dependencies: backend, provider and owner privacy decisions.
- Test consent default unchecked, invalid/absent consent rejected server-side, exact version in controlled storage, rights requests, delete/suppress/resubscribe policy, 375px access and no-JS unsubscribe; network inspect before/after cookie choices.

### 29 — SEO/sharing (PARTIAL)

- Change only production metadata generation in `scripts/build.mjs:15` to produce absolute reciprocal language alternates using validated SITE_URL; retain relative navigation/asset links in source for downloadable previews. Align canonical root/index variants, sitemap URLs and OG image dimensions with the chosen domain. Update tests, not the domain by guesswork.
- No SQL/schema/new route/dependency; existing SITE_URL env suffices. **S**. Risks: wrong origin, duplicate indexing, English canonical pointing to Greek and revealing private status pages; dependencies: confirmed production hostname and actual deployment path.
- Test generated HTML in `/tmp` with Lighthouse/structured assertions and both language pairs; test 200 OG image and real share fetcher on deployment; inspect noindex status pages and canonical redirects; check mobile page title and language switch remain intact.

### 30 — Accessibility (PARTIAL)

- `public/styles.css:243`, `:246` and shared nav/consent styles: expand interactive hit areas to the requested 44×44px without crowding mobile. Review actual clickable consent label (not just the 20px checkbox); privacy text link must retain a usable target. Update language control's visible/accessible name consistently across all HTML pairs so speech-input labels are predictable. Fix mobile heading scale with item 1.
- Preserve labels, focus-visible styling, error live regions, native details, keyboard slider controls, manual pause and reduced motion. Source: `public/index.html:3`, `public/site.js:26`, `:160`, `public/styles.css:4`, `:153`. No SQL/env/dependency. **M**.
- Risks: header overflow and hiding policy access; depends on landing/navigation choice. Test 375px/desktop keyboard and 200% zoom, touch hit areas, screen-reader labels/announcements, contrast against actual media frames and errors, no-JS and reduced motion. WCAG 2.5.8 AA's baseline is not universally 44px: the report uses the stricter requested 44px target rather than mislabelling every smaller inline link an AA failure. The label-in-name issue needs explicit manual/assistive-tech confirmation.

### Additional source-PASS / deployment-UNVERIFIED hardening

Item 18: add a server-side bounded rate limit before storage calls, with a privacy-reviewed short-lived IP HMAC or provider equivalent, coarse errors and monitored Google/Supabase quotas; protect resend/referral/survey routes too. Files: signup handler, new backend-only limiter, hosting rules/README/tests. **M**, selected storage/provider/env unresolved. Test burst/distributed abuse without running load tests against production; origin headers alone are forgeable.

Item 31: inspect deployed HTTPS headers and function responses; prove private Sheet/service-role/anon access and scoped environment injection; run an approved redacting secret scan of current repository/history and deployment bundles; do not dump env values. Review public asset provenance JSON for unnecessary internal paths (`public/assets/philosophy/provenance.json:6`) as low-priority disclosure hygiene, not a leaked credential. **S–M**. These checks need hosting/provider access; no setting was changed in this audit.

### Proposed database SQL — report only, not applied

**No database migration is necessary if retaining the current Google Sheets backend.** Equivalent new fields/ledgers would require a reviewed Sheets receiver change and careful existing-row/header migration; blindly appending new columns to `getRange(...,5)` is unsafe. The following SQL is a possible **Supabase-only** design, contingent on selecting that backend. It is not a verified migration against any existing database. It uses built-in `gen_random_uuid()` on a supported Supabase PostgreSQL version; verify supported roles/version and existing object names first. Back up/reconcile existing data and test in staging. No seed offers, prices, deadlines or rewards are invented.

#### SQL-A — private capture, consent and attribution (items 17, 19, 22, 28)

```sql
begin;

create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  join_sequence bigint generated always as identity unique,
  email text not null check (email = btrim(email) and char_length(email) between 3 and 254),
  created_at timestamptz not null default now(),
  consented_at timestamptz not null default now(),
  consent_text_version text not null,
  privacy_version text not null,
  marketing_consent boolean not null check (marketing_consent),
  locale text not null check (locale in ('el', 'en')),
  source text not null check (char_length(source) <= 80),
  landing_path text check (char_length(landing_path) <= 256),
  utm_source text check (char_length(utm_source) <= 128),
  utm_medium text check (char_length(utm_medium) <= 128),
  utm_campaign text check (char_length(utm_campaign) <= 128),
  utm_term text check (char_length(utm_term) <= 128),
  utm_content text check (char_length(utm_content) <= 128),
  referrer_origin text check (char_length(referrer_origin) <= 256),
  verified_at timestamptz,
  withdrawn_at timestamptz
);
create unique index waitlist_signups_email_ci
  on public.waitlist_signups (lower(email));

create table public.waitlist_consent_events (
  id bigint generated always as identity primary key,
  signup_id uuid not null references public.waitlist_signups(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  event_type text not null check (event_type in ('granted', 'withdrawn')),
  consent_text_version text not null,
  privacy_version text not null,
  locale text not null check (locale in ('el', 'en'))
);

alter table public.waitlist_signups enable row level security;
alter table public.waitlist_consent_events enable row level security;
revoke all on table public.waitlist_signups, public.waitlist_consent_events
  from public, anon, authenticated;
grant select, insert, update, delete on table
  public.waitlist_signups, public.waitlist_consent_events to service_role;
grant usage, select on sequence public.waitlist_signups_join_sequence_seq,
  public.waitlist_consent_events_id_seq to service_role;
-- No anonymous/authenticated policies. Only the server's service role may access records.
-- Never embed the service-role credential in the browser or a public environment variable.
commit;
```

The server still must validate email (the SQL constraint is not a full email validator), consent, allowed sources/UTMs/referrer origins and lengths. Wrap insertion + consent event + optional outbox creation in a single reviewed database transaction/private RPC; separate REST calls are not atomic. Do not grant a browser-executable SECURITY DEFINER function by default. Handle the `lower(email)` conflict generically and atomically: keep the existing record and do not overwrite consent time or re-subscribe a withdrawn address from an ordinary duplicate POST. Decide confirmed re-consent explicitly. Do not make `join_sequence` a public lookup key or claim it is current queue rank. RLS does not protect against a leaked service-role key; access control remains a server responsibility. These SQL definitions have not been executed or validated against a target instance.

#### SQL-B — offer eligibility (item 10, only if a real offer is approved)

```sql
begin;
alter table public.waitlist_signups
  add column offer_terms_version text,
  add column offer_eligible_at timestamptz;
commit;
```

Record a versioned approved offer; this is not redemption/discount enforcement. If single-use codes are needed, design a transactional unique redemption ledger and provider reconciliation separately. Do not backfill eligibility or deadlines without approved rules.

#### SQL-C — durable welcome/email outbox (item 20)

```sql
begin;
create table public.waitlist_email_outbox (
  id bigint generated always as identity primary key,
  signup_id uuid not null references public.waitlist_signups(id) on delete cascade,
  template_version text not null,
  kind text not null check (kind in ('welcome', 'verify')),
  status text not null default 'pending'
    check (status in ('pending','sending','sent','failed','suppressed')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  lease_until timestamptz,
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (signup_id, kind, template_version)
);
alter table public.waitlist_email_outbox enable row level security;
revoke all on table public.waitlist_email_outbox from public, anon, authenticated;
grant select, insert, update, delete on table public.waitlist_email_outbox to service_role;
grant usage, select on sequence public.waitlist_email_outbox_id_seq to service_role;
commit;
```

A worker needs transactional leasing (`FOR UPDATE SKIP LOCKED` or equivalent), lease recovery, bounded retries, provider idempotency keys and a suppression/withdrawal check immediately before each send. A `sent_at` means provider acceptance unless delivery webhooks confirm delivery; do not conflate them. Verification tokens should be random/signed, hashed at rest where appropriate, purpose-scoped and expiring; no token implementation is implied by this schema.

#### SQL-D — referral attribution and versioned rewards (items 23, 24; optional)

```sql
begin;
alter table public.waitlist_signups
  add column referral_code uuid not null default gen_random_uuid() unique;

create table public.waitlist_referrals (
  referred_signup_id uuid primary key
    references public.waitlist_signups(id) on delete cascade,
  referrer_signup_id uuid not null
    references public.waitlist_signups(id) on delete cascade,
  created_at timestamptz not null default now(),
  qualified_at timestamptz,
  disqualified_at timestamptz,
  check (referred_signup_id <> referrer_signup_id)
);
create index waitlist_referrals_by_referrer
  on public.waitlist_referrals (referrer_signup_id);

create table public.waitlist_reward_tiers (
  id uuid primary key default gen_random_uuid(),
  terms_version text not null,
  qualified_referrals_required integer not null check (qualified_referrals_required > 0),
  reward_description text not null,
  active boolean not null default false,
  unique (terms_version, qualified_referrals_required)
);
create table public.waitlist_reward_awards (
  signup_id uuid not null references public.waitlist_signups(id) on delete cascade,
  tier_id uuid not null references public.waitlist_reward_tiers(id),
  awarded_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  revoked_at timestamptz,
  primary key (signup_id, tier_id)
);

alter table public.waitlist_referrals enable row level security;
alter table public.waitlist_reward_tiers enable row level security;
alter table public.waitlist_reward_awards enable row level security;
revoke all on table public.waitlist_referrals, public.waitlist_reward_tiers,
  public.waitlist_reward_awards from public, anon, authenticated;
grant select, insert, update, delete on table public.waitlist_referrals,
  public.waitlist_reward_tiers, public.waitlist_reward_awards to service_role;
commit;
```

An opaque referral code is shareable attribution only. Server-side qualification must prevent self/cyclic/duplicate/fraud credits, reconcile withdrawal/deletion and enforce approved terms. Database constraints above do not solve fraud or fulfilment; never expose referrals/emails with a public SELECT policy. No tier rows are proposed without owner approval. Public progress/status requires a separate authenticated/signed access design, not lookup by email, sequence or referral code.

#### SQL-E — optional non-sensitive post-capture survey (item 25)

```sql
begin;
create table public.waitlist_survey_answers (
  signup_id uuid primary key
    references public.waitlist_signups(id) on delete cascade,
  survey_version text not null,
  price_band_code text check (char_length(price_band_code) <= 40),
  preference_code text check (char_length(preference_code) <= 40),
  answered_at timestamptz not null default now()
);
alter table public.waitlist_survey_answers enable row level security;
revoke all on table public.waitlist_survey_answers from public, anon, authenticated;
grant select, insert, update, delete on table public.waitlist_survey_answers to service_role;
commit;
```

The endpoint validates approved coded choices and signed proof of confirmed capture, not a bare signup ID. Do not put diagnoses or unrestricted skin-problem text into this general survey. A sensitive-data use case needs separate purpose, lawful-basis/consent/retention/access design and legal review; it is not silently accommodated by a nullable text column.

## 4. Suggested build order — small reviewable steps

1. **Traffic gate:** confirm repository/deployment/backend; obtain current live-storage/permission evidence; approve interim claim cleanup and privacy/consent fixes. Do not start paid traffic while capture is failing or definitive unsubstantiated claims remain. Current source already has explicit consent; do not pretend it is missing.
2. **Capture correctness:** configure/validate existing Sheets or implement the explicitly selected private Supabase adapter/migration. Ship with controlled save, duplicate, failure and access-control evidence and a rollback plan. Do not rewrite the whole frontend merely to add Supabase.
3. **Consent and operations:** exact wording versions, minimal attribution, retention/suppression and ownership of withdrawal requests; rate-limit public routes before scaling traffic.
4. **Truthful first screen:** approved interim copy, verified open-tin photograph, readable heading, short explanatory line, unchanged consent and visible mobile form. Keep all unresolved formula assertions out of definitive language.
5. **Persuasion and CTA:** short recognition, evidence-supported benefits, development trust, concise FAQ, same incentive/cadence at both forms. A focused campaign route can be a separate independently shippable change if approved.
6. **Performance/accessibility/SEO:** modern responsive assets, deferred offscreen media, stable font/hero sizing, 44px targets/name parity, generated absolute hreflang and deployed sharing checks. Preserve the existing visual identity and no-JS/reduced-motion behaviours.
7. **Measurement:** consent-aware minimal funnel events and validated UTM handling; reconcile success with durable unique storage. Define what qualifies as demand before spending on traffic; separate duplicate, unverified and confirmed addresses.
8. **Post-capture:** clear next steps and reliable welcome/verification + unsubscribe; then optional non-sensitive price/preference research.
9. **Optional growth:** only after capture and qualification are reliable, decide whether a meaningful queue, referrals and funded rewards are worth their complexity. No fabricated social proof/urgency.
10. **Final review:** targeted regression tests, real controlled production integration, 375px and desktop/no-JS/reduced-motion checks, privacy/claims signoff, then a bounded visual polish pass. Implementation still requires owner approval; this report is the stopping point.

## 5. Open owner questions

1. **Which app is authoritative?** Is `booksfordazzle/chatgpt` / this static bilingual branch the intended site, or is there another Next.js + Supabase repository/deployment? Keep Sheets or explicitly migrate to Supabase? Provide the deployment URL/configuration access through supported secure channels, not secret values in chat.
2. Which formula option is selected, when will it be locked, and which sourcing/INCI/size/usage/sensory facts are actually confirmed? Current code includes both mastic and jojoba, and omits sea buckthorn from the named list. No option was selected in this audit.
3. Which final-formula evidence supports hydration, fine-line, barrier, antibacterial, redness, regeneration, firming, sebum/non-comedogenic and ageing claims? Who approves wording and historical/EMA references?
4. Identify the five original tin photos and usage rights. Which image accurately shows the current developmental texture/packaging? May the hero's composition/film change, and does the earlier unidentified “img2” refer to another still-retained block?
5. Is the existing early-bird 15% offer authorised and funded? What are its eligibility/redemption/expiry terms? If not, what honest incentive should replace it?
6. What is the realistic next milestone, launch window if known, and update cadence? No date or scarcity will be invented.
7. Confirm controller's complete address, monitored mailbox, retention/deletion/suppression policy, hosting/processor/transfer arrangements and withdrawal-response owner.
8. Which email provider/sender domain is approved? Is double opt-in desired for qualification? Who owns unsubscribe, bounce/complaint handling and controlled delivery tests?
9. Which analytics provider and campaign sources are intended? Is an ad pixel necessary, what consent model is approved, and how is a qualified signup defined?
10. Should a no-menu acquisition route be separate from the existing owner-specified bilingual site navigation?
11. Is there a real priority queue? If referrals/rewards are desired, what qualifies, which funded tiers/terms apply, and who fulfils them? These are optional, not required before core demand validation.
12. Which optional price bands/preference question would answer a business decision? Avoid sensitive health questions unless there is an explicit reviewed basis to collect them.

**Approval gate:** Review this report and select the first implementation scope. No code, formula decision, database migration, provider setup or publication has been performed as a result of this audit.

## Appendix A — exhaustive ingredient/count/sensory text-location index

The following index is extracted from all current Greek/English source HTML, including headings, paragraphs, list items, summaries, captions, title/meta text, image alt and video/ARIA labels. Each entry gives its physical source line and an exact normalised-whitespace excerpt. It deliberately includes general educational ingredient statements and conditional/cautionary statements; inclusion is **not** a finding that every statement is false or needs removal. Tags identify ingredients, count assertions and/or sensory language. Review each against the final approved formula and its context. Navigation titles/metadata repeat facts and must be updated too. Binary artwork/film text is separately UNVERIFIED; no text search can establish its full content. Generic ingredient videos/slides have five-item indices; changing the actual list requires updating their count labels as well as prose. This index excludes generated `dist`, tests, hidden draft files and unrelated external documents.


Index coverage: **34 source HTML documents; 848 matching text/attribute locations**. Repeated English/Greek and metadata occurrences are retained intentionally.

### public/about.html — 7 matching locations

- `public/about.html:4` — `img@alt` [sensory]: Κοντινή λήψη της υφής του balm
- `public/about.html:5` — `p` [ingredient]: Ψάχνοντας, συναντούσαμε ξανά και ξανά το tallow — το καθαρισμένο λίπος βοοειδών.
- `public/about.html:5` — `p` [ingredient]: Αυτή η πρώτη ύλη έγινε η αφετηρία για το PRIMAL CORE: ένα ανδρικό face balm που συνδυάζει παραδοσιακά συστατικά με μια σύγχρονη προσέγγιση στη σύνθεση.
- `public/about.html:6` — `img@alt` [ingredient]: Ανοιχτό δοχείο PRIMAL CORE Beef Tallow & Mastic 50 ml
- `public/about.html:6` — `p` [ingredient,sensory]: Ένα άνυδρο face balm με βάση το βόειο στέαρ.
- `public/about.html:6` — `p` [sensory]: Στόχος μας είναι η μαλακτική φροντίδα, η ευχάριστη υφή και μια απλή καθημερινή εφαρμογή.
- `public/about.html:7` — `li` [ingredient]: Κάθε συστατικό πρέπει να έχει συγκεκριμένο λειτουργικό ρόλο.

### public/blog/ancestral-ingredients.html — 51 matching locations

- `public/blog/ancestral-ingredients.html:3` — `title` [ingredient]: Beef Tallow: Η επιστροφή στις ρίζες της περιποίησης \| PRIMAL CORE
- `public/blog/ancestral-ingredients.html:3` — `meta@content` [ingredient]: Γιατί ένα συστατικό που χρησιμοποιείται εδώ και αιώνες επιστρέφει στη σύγχρονη ανδρική περιποίηση προσώπου.
- `public/blog/ancestral-ingredients.html:3` — `meta@content` [ingredient]: Beef Tallow: Η επιστροφή στις ρίζες της περιποίησης \| PRIMAL CORE
- `public/blog/ancestral-ingredients.html:3` — `h1` [ingredient]: Beef Tallow: Η επιστροφή στις ρίζες της περιποίησης
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Γιατί ένα συστατικό που χρησιμοποιείται εδώ και αιώνες επιστρέφει στη σύγχρονη ανδρική περιποίηση προσώπου.
- `public/blog/ancestral-ingredients.html:3` — `img@alt` [ingredient]: Ανοιχτό δοχείο PRIMAL CORE Beef Tallow & Mastic 50 ml με βάλσαμο και μαστίχα
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Οροί. Ενεργά συστατικά. Εξειδικευμένες κρέμες. Πρωινές και βραδινές ρουτίνες. Διαφορετικά προϊόντα για διαφορετικές περιοχές του προσώπου.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Και αυτή ακριβώς είναι η σκέψη πίσω από την επιστροφή ενός παραδοσιακού συστατικού: του beef tallow.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Πριν εμφανιστούν οι βιομηχανικές κρέμες, οι άνθρωποι χρησιμοποιούσαν διάφορα ζωικά λίπη και φυτικά έλαια για την περιποίηση και την προστασία του δέρματός τους από το κρύο και την ξηρότητα.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Ένα από αυτά ήταν το tallow: το καθαρισμένο λίπος βοοειδών.
- `public/blog/ancestral-ingredients.html:3` — `h2` [ingredient]: 2. Γιατί το Beef Tallow έχει θέση στη σύγχρονη περιποίηση;
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Το beef tallow δεν είναι κάποιο μυστηριώδες συστατικό.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient,sensory]: Είναι μια λιπαρή πρώτη ύλη που αποτελείται κυρίως από τριγλυκερίδια, με σημαντική παρουσία τριών λιπαρών οξέων:
- `public/blog/ancestral-ingredients.html:3` — `li` [ingredient]: Ελαϊκό οξύ: Συνδέεται με τη μαλακτική συμπεριφορά και την αίσθηση των λιπαρών συστατικών.
- `public/blog/ancestral-ingredients.html:3` — `li` [ingredient]: Παλμιτικό οξύ: Συναντάται επίσης στο φυσικό σμήγμα της επιδερμίδας και χρησιμοποιείται στην κοσμετολογία.
- `public/blog/ancestral-ingredients.html:3` — `li` [ingredient,sensory]: Στεατικό οξύ: Συμβάλλει στη δομή, τη σταθερότητα και την υφή πολλών καλλυντικών προϊόντων.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Αυτός ο συνδυασμός καθιστά το tallow ενδιαφέρουσα πρώτη ύλη για τη δημιουργία πλούσιων, μαλακτικών προϊόντων περιποίησης.
- `public/blog/ancestral-ingredients.html:3` — `p` [sensory]: Η λιπαρή φύση του μπορεί να συμβάλει στη δημιουργία ενός προστατευτικού στρώματος στην επιφάνεια του δέρματος, περιορίζοντας την αίσθηση ξηρότητας.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Clean ingredients.
- `public/blog/ancestral-ingredients.html:3` — `p` [sensory]: Χωρίς parabens. Χωρίς sulfates. Χωρίς τεχνητά αρώματα.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Όμως η απουσία ενός συστατικού δεν αποτελεί από μόνη της απόδειξη ποιότητας.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient,count]: Ένα προϊόν με πέντε συστατικά δεν είναι απαραίτητα ασφαλέστερο από ένα προϊόν με είκοσι.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Και ένα φυσικό συστατικό μπορεί επίσης να προκαλέσει ανεπιθύμητες αντιδράσεις.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Κάθε συστατικό πρέπει να έχει συγκεκριμένο λόγο ύπαρξης.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Λίγα, προσεκτικά επιλεγμένα συστατικά.
- `public/blog/ancestral-ingredients.html:3` — `p` [sensory]: Χωρίς προσθήκη νερού.
- `public/blog/ancestral-ingredients.html:3` — `p` [sensory]: Χωρίς συνθετικό άρωμα.
- `public/blog/ancestral-ingredients.html:3` — `h2` [ingredient]: 4. Η σχέση του Beef Tallow με τα φυσικά λιπίδια του δέρματος
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient,sensory]: Ανάμεσα στα κύτταρα υπάρχουν λιπίδια, κυρίως κεραμίδια, χοληστερόλη και ελεύθερα λιπαρά οξέα, που συμβάλλουν στον περιορισμό της απώλειας νερού.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Το beef tallow περιέχει λιπαρά οξέα που συναντώνται επίσης σε διάφορα φυσικά λιπίδια του ανθρώπινου σώματος.
- `public/blog/ancestral-ingredients.html:3` — `p` [sensory]: Μπορεί να βοηθήσει το δέρμα να αισθάνεται πιο απαλό και να περιορίσει την απώλεια υγρασίας μέσω της λιπαρής προστατευτικής επίστρωσης που σχηματίζει.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Η αποτελεσματικότητα δεν βρίσκεται μόνο στο βασικό συστατικό. Βρίσκεται στον τρόπο που το χρησιμοποιείς.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Έχει δημιουργήσει προϊόντα με καλύτερη σταθερότητα, προηγμένα συστήματα μεταφοράς συστατικών και στοχευμένες εφαρμογές.
- `public/blog/ancestral-ingredients.html:3` — `p` [sensory]: Μια ενυδατική που απλώνεται εύκολα.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Αυτή η ανάγκη δεν απαιτεί απαραίτητα μια σύνθεση με δεκάδες συστατικά.
- `public/blog/ancestral-ingredients.html:3` — `h3` [sensory]: Γιατί επιλέγουμε μια άνυδρη προσέγγιση
- `public/blog/ancestral-ingredients.html:3` — `p` [sensory]: Το PRIMAL CORE αναπτύσσεται ως άνυδρο face balm, δηλαδή χωρίς προσθήκη νερού.
- `public/blog/ancestral-ingredients.html:3` — `p` [sensory]: Αυτό επιτρέπει τη δημιουργία μιας λιπαρής σύνθεσης χωρίς να απαιτείται η κλασική διαδικασία γαλακτωματοποίησης νερού και ελαίων.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Η φύση δεν δημιουργεί συστατικά με σκοπό την ανθρώπινη περιποίηση.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Αντίστοιχα, ένα συνθετικό συστατικό δεν είναι απαραίτητα επιβλαβές.
- `public/blog/ancestral-ingredients.html:3` — `p` [sensory]: Αυτό που έχει σημασία είναι η σωστή επιλογή, η κατάλληλη συγκέντρωση, η σταθερότητα και η ασφάλεια της τελικής σύνθεσης.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Επομένως, η χρήση του beef tallow δεν αποτελεί από μόνη της εγγύηση αποτελεσματικότητας.
- `public/blog/ancestral-ingredients.html:3` — `h2` [ingredient]: 7. Το Beef Tallow είναι η βάση. Όχι ολόκληρη η λύση.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Υπάρχει μια τάση να παρουσιάζεται το beef tallow ως το μοναδικό συστατικό που χρειάζεται το δέρμα.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Το beef tallow μπορεί να αποτελέσει τη βάση μιας καλλυντικής σύνθεσης.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient,sensory]: Άλλα συστατικά μπορούν να χρησιμοποιηθούν για να επηρεάσουν την υφή, την απλωσιμότητα, την οξειδωτική σταθερότητα ή τη συνολική αίσθηση εφαρμογής.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Γιατί το ζητούμενο δεν είναι απλώς να φτιάξουμε ένα balm με beef tallow.
- `public/blog/ancestral-ingredients.html:3` — `p` [sensory]: Πώς θα οργανώσουμε τη δουλειά μας.
- `public/blog/ancestral-ingredients.html:3` — `h2` [ingredient]: PRIMAL CORE: ANCESTRAL INGREDIENTS. MODERN FORMULATION.
- `public/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Το PRIMAL CORE είναι ένα ανδρικό face balm υπό ανάπτυξη, με βασικό συστατικό το beef tallow.
- `public/blog/ancestral-ingredients.html:3` — `p` [sensory]: Σχεδιάζεται με στόχο τη μαλακτική φροντίδα, την καθημερινή άνεση και μια ευχάριστη, μη υπερβολικά λιπαρή αίσθηση εφαρμογής.

### public/blog/chios-mastic-skincare.html — 54 matching locations

- `public/blog/chios-mastic-skincare.html:3` — `title` [ingredient]: Μαστίχα Χίου: Το φυσικό συστατικό με 2.500 χρόνια ιστορίας που επιστρέφει στην περιποίηση του προσώπου \| PRIMAL CORE
- `public/blog/chios-mastic-skincare.html:3` — `meta@content` [ingredient]: Η προέλευση, η ιστορία και το ερευνητικό ενδιαφέρον της μαστίχας Χίου στην περιποίηση του προσώπου.
- `public/blog/chios-mastic-skincare.html:3` — `meta@content` [ingredient]: Μαστίχα Χίου: Το φυσικό συστατικό με 2.500 χρόνια ιστορίας που επιστρέφει στην περιποίηση του προσώπου
- `public/blog/chios-mastic-skincare.html:3` — `h1` [ingredient]: Μαστίχα Χίου: Το φυσικό συστατικό με 2.500 χρόνια ιστορίας που επιστρέφει στην περιποίηση του προσώπου
- `public/blog/chios-mastic-skincare.html:3` — `img@alt` [ingredient]: Χρυσαφένια δάκρυα μαστίχας πάνω σε σκοτεινή πέτρα
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Ένα μικρό δάκρυ ρητίνης. Μια ιστορία χιλιάδων ετών. Και ένα φυσικό συστατικό που συνεχίζει να προκαλεί το ενδιαφέρον της επιστήμης.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Στο νότιο τμήμα της Χίου, ένα ιδιαίτερο δέντρο παράγει κάτι που δύσκολα συναντάς αλλού στον κόσμο: τη μαστίχα Χίου.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient,sensory]: Μια φυσική ρητίνη με χαρακτηριστικό άρωμα, σύνθετη χημική σύσταση και ιστορία που ξεκινά από την αρχαιότητα.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Οι περισσότεροι τη γνωρίζουν από τη γεύση της. Λιγότεροι γνωρίζουν ότι η μαστίχα Χίου χρησιμοποιείται και στα καλλυντικά, ενώ οι ερευνητές μελετούν τις ιδιότητες των συστατικών της και τις πιθανές εφαρμογές τους στην περιποίηση της επιδερμίδας.
- `public/blog/chios-mastic-skincare.html:3` — `h2` [ingredient]: Τι είναι η μαστίχα Χίου;
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient,sensory]: Η μαστίχα Χίου είναι μια φυσική, αρωματική ρητίνη που παράγεται από τον σχίνο (Pistacia lentiscus var. Chia), ο οποίος καλλιεργείται παραδοσιακά στη νότια Χίο.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Οι καλλιεργητές πραγματοποιούν μικρές τομές στον κορμό και στα κλαδιά του δέντρου. Από αυτές εκκρίνεται η ρητίνη, η οποία σταδιακά στερεοποιείται σχηματίζοντας τα χαρακτηριστικά «δάκρυα» της μαστίχας.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Η μαστίχα Χίου αποτελεί προϊόν Προστατευόμενης Ονομασίας Προέλευσης (ΠΟΠ) από το 1997, ενώ το 2014 η παραδοσιακή τεχνογνωσία της καλλιέργειάς της εντάχθηκε στον κατάλογο Άυλης Πολιτιστικής Κληρονομιάς της UNESCO.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Δεν είναι απλώς ένα ακόμη φυτικό συστατικό. Είναι ένα προϊόν στενά συνδεδεμένο με έναν συγκεκριμένο τόπο, τους ανθρώπους του και μια μακρά παράδοση.
- `public/blog/chios-mastic-skincare.html:3` — `h2` [ingredient]: Μαστίχα Χίου και επιδερμίδα: Ποιες είναι οι ιδιότητές της;
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Το ενδιαφέρον για τη μαστίχα Χίου στην περιποίηση του προσώπου σχετίζεται κυρίως με τη χημική της σύσταση.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient,sensory]: Η ρητίνη περιέχει διάφορες φυσικές ενώσεις, μεταξύ των οποίων τριτερπένια και αρωματικά συστατικά, που αποτελούν αντικείμενο επιστημονικής έρευνας.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Ορισμένα συστατικά και εκχυλίσματα της μαστίχας έχουν παρουσιάσει αντιοξειδωτική δραστηριότητα σε εργαστηριακές μελέτες.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Ωστόσο, η εργαστηριακή αντιοξειδωτική δράση δεν αποδεικνύει από μόνη της ότι ένα προϊόν με μαστίχα προστατεύει το ανθρώπινο δέρμα από την πρόωρη γήρανση.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Ένα από τα πιο ενδιαφέροντα πεδία έρευνας αφορά τη σχέση ορισμένων ενώσεων της μαστίχας με ένζυμα που συμμετέχουν στη διάσπαση δομικών πρωτεϊνών του δέρματος.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Μια επιστημονική μελέτη που δημοσιεύθηκε το 2024 στο περιοδικό Cosmetics εξέτασε τη χημική σύσταση της μαστίχας Χίου και τη δράση συστατικών της απέναντι στα ένζυμα κολλαγενάση και ελαστάση.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Τα αποτελέσματα δείχνουν ότι η μαστίχα αποτελεί ενδιαφέρον αντικείμενο έρευνας για μελλοντικές καλλυντικές εφαρμογές.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Δεν αποδεικνύουν, όμως, ότι μια κρέμα με μαστίχα μειώνει τις ρυτίδες, αυξάνει το κολλαγόνο ή συσφίγγει το δέρμα.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Η μαστίχα Χίου έχει μελετηθεί και για την αντιμικροβιακή δραστηριότητα ορισμένων εκχυλισμάτων και συστατικών της.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Ωστόσο, η αντιμικροβιακή δράση σε εργαστηριακές συνθήκες δεν σημαίνει ότι η μαστίχα αντιμετωπίζει την ακμή ή θεραπεύει δερματικές λοιμώξεις.
- `public/blog/chios-mastic-skincare.html:3` — `h3` [ingredient]: 4. Ένα φυσικό συστατικό για σύγχρονες καλλυντικές συνθέσεις
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Η μαστίχα μπορεί να χρησιμοποιηθεί σε διαφορετικές μορφές, όπως εκχυλίσματα και παράγωγα, ανάλογα με τον σκοπό της καλλυντικής σύνθεσης.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Η επιλογή της κατάλληλης μορφής, η συγκέντρωση, η σταθερότητα και η συμβατότητα με τα υπόλοιπα συστατικά καθορίζουν τη λειτουργία της μέσα στο τελικό προϊόν.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Επειδή οι ιδιότητες ενός συστατικού δεν είναι αυτομάτως και αποδεδειγμένες ιδιότητες κάθε προϊόντος που το περιέχει.
- `public/blog/chios-mastic-skincare.html:3` — `h2` [ingredient]: Μαστίχα Χίου για το πρόσωπο: Τι λέει πραγματικά η επιστήμη;
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Η μαστίχα Χίου έχει σημαντική ιστορία χρήσης και ενδιαφέρουσα χημική σύσταση.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Η μελέτη των Stamou και συνεργατών (2024) ανέδειξε το δυναμικό συγκεκριμένων συστατικών της μαστίχας για καλλυντικές εφαρμογές, μέσα από χημική ανάλυση και εργαστηριακή βιολογική αξιολόγηση.
- `public/blog/chios-mastic-skincare.html:3` — `h2` [ingredient]: Γιατί η μαστίχα Χίου έχει θέση στη φιλοσοφία του PRIMAL CORE;
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Beef tallow: Ένα ζωικό λίπος με λιπαρά οξέα, το οποίο μπορεί να λειτουργήσει ως βάση σε μια πλούσια, μαλακτική καλλυντική σύνθεση.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Μαστίχα Χίου: Μια ελληνική φυσική ρητίνη με ιδιαίτερη χημική σύσταση, ιστορία και ερευνητικό ενδιαφέρον για καλλυντικές εφαρμογές.
- `public/blog/chios-mastic-skincare.html:3` — `h2` [ingredient]: Είναι η μαστίχα Χίου κατάλληλη για κάθε τύπο δέρματος;
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Όπως συμβαίνει με κάθε καλλυντικό συστατικό φυτικής προέλευσης, η μαστίχα δεν είναι απαραίτητα κατάλληλη για όλους.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Η ανοχή εξαρτάται από τη μορφή του συστατικού, τη συγκέντρωσή του, τη συνολική σύνθεση και τις ιδιαίτερες ανάγκες της επιδερμίδας.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Η φυσική προέλευση ενός συστατικού δεν εγγυάται ότι δεν μπορεί να προκαλέσει ερεθισμό.
- `public/blog/chios-mastic-skincare.html:3` — `h2` [ingredient]: Συχνές ερωτήσεις για τη μαστίχα Χίου
- `public/blog/chios-mastic-skincare.html:3` — `h3` [ingredient]: Κάνει καλό η μαστίχα Χίου στο πρόσωπο;
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Η μαστίχα περιέχει φυσικές ενώσεις με ενδιαφέρουσες ιδιότητες που μελετώνται για καλλυντικές εφαρμογές. Τα πιθανά οφέλη στο πρόσωπο εξαρτώνται από την τελική σύνθεση του προϊόντος και την επιστημονική τεκμηρίωσή του.
- `public/blog/chios-mastic-skincare.html:3` — `h3` [ingredient]: Βοηθά η μαστίχα Χίου στις ρυτίδες;
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Εργαστηριακές μελέτες έχουν εξετάσει την επίδραση συστατικών της σε ένζυμα που σχετίζονται με τη διάσπαση κολλαγόνου και ελαστίνης. Δεν υπάρχουν επαρκή κλινικά δεδομένα από αυτές τις μελέτες ώστε να υποστηριχθεί ότι η μαστίχα μειώνει τις ρυτίδες στο ανθρώπινο πρόσωπο.
- `public/blog/chios-mastic-skincare.html:3` — `h3` [ingredient]: Είναι κατάλληλη η μαστίχα Χίου για ξηρό δέρμα;
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient,sensory]: Η καταλληλότητα εξαρτάται από τη συνολική καλλυντική σύνθεση. Ένα balm που περιέχει μαστίχα μπορεί να περιλαμβάνει και μαλακτικά λιπίδια, τα οποία βοηθούν την επιδερμίδα να διατηρεί την απαλότητά της.
- `public/blog/chios-mastic-skincare.html:3` — `h3` [ingredient]: Μπορεί η μαστίχα Χίου να χρησιμοποιηθεί καθημερινά;
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Αυτό εξαρτάται από το συγκεκριμένο προϊόν, τις οδηγίες χρήσης και την ανοχή του δέρματος. Δεν συνιστάται η εφαρμογή ακατέργαστης ρητίνης απευθείας στο πρόσωπο χωρίς κατάλληλη καλλυντική επεξεργασία.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Η μαστίχα Χίου δεν χρειάζεται υπερβολικές υποσχέσεις για να έχει ενδιαφέρον.
- `public/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Η μοναδική της προέλευση, η παραδοσιακή συλλογή της και η ιδιαίτερη χημική της σύσταση είναι ήδη αρκετοί λόγοι για να την εξετάσουμε ως συστατικό σύγχρονης περιποίησης.
- `public/blog/chios-mastic-skincare.html:3` — `li` [ingredient]: Stamou, P. et al. (2024). Revealing the Potential of Chios Mastic Gum and Its Constituents for Cosmetic Applications through Chemical Profiling and Biological Evaluation. Cosmetics, 11(5), 155.
- `public/blog/chios-mastic-skincare.html:3` — `li` [ingredient]: UNESCO (2014). Know-how of cultivating mastic on the island of Chios.
- `public/blog/chios-mastic-skincare.html:3` — `li` [ingredient]: European Commission. Masticha Chiou — Protected Designation of Origin (PDO).
- `public/blog/chios-mastic-skincare.html:3` — `li` [ingredient]: Ένωση Μαστιχοπαραγωγών Χίου — Πληροφορίες για την προέλευση, την παραγωγή και την καλλιέργεια της μαστίχας.

### public/blog/hippocrates-tallow-mastic.html — 26 matching locations

- `public/blog/hippocrates-tallow-mastic.html:3` — `title` [ingredient]: Από τον Ιπποκράτη στο PRIMAL CORE: Η Ξεχασμένη Ιστορία του Βόειου Στέαρ και της Μαστίχας Χίου στην Αρχαία Ελλάδα \| PRIMAL CORE
- `public/blog/hippocrates-tallow-mastic.html:3` — `meta@content` [ingredient]: Η ιστορία του στέατος και της μαστίχας Χίου στην αρχαία ελληνική περιποίηση και η έμπνευση πίσω από το PRIMAL CORE.
- `public/blog/hippocrates-tallow-mastic.html:3` — `meta@content` [ingredient]: Από τον Ιπποκράτη στο PRIMAL CORE: Η Ξεχασμένη Ιστορία του Βόειου Στέαρ και της Μαστίχας Χίου στην Αρχαία Ελλάδα
- `public/blog/hippocrates-tallow-mastic.html:3` — `h1` [ingredient]: Από τον Ιπποκράτη στο PRIMAL CORE: Η Ξεχασμένη Ιστορία του Βόειου Στέαρ και της Μαστίχας Χίου στην Αρχαία Ελλάδα
- `public/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: Πριν η σύγχρονη βιομηχανία ομορφιάς γεμίσει τα ράφια με συνθετικά πολυμερή και χημικά συντηρητικά, οι αρχαίοι Έλληνες είχαν ήδη αποκωδικοποιήσει τη βιολογία της επιδερμίδας. Η σύγχρονη τάση του ancestral skincare (προγονική περιποίηση) δεν είναι μια νέα εφεύρεση. Είναι η επιστροφή σε τεχνικές και συστατικά που τεκμηριώθηκαν επιστημονικά πριν από 2.500 χρόνια.
- `public/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: Στο επίκεντρο αυτής της παράδοσης βρίσκονται δύο πανίσχυρα φυσικά υλικά: το καθαρό ζωικό λίπος (beef tallow ή αρχαίο στέαρ) και η ρητίνη της μαστίχας Χίου.
- `public/blog/hippocrates-tallow-mastic.html:3` — `h2` [ingredient]: 1. Τα Αρχαία Λήμματα: «Στέαρ», «Πιμελή» και «Οίσυπος»
- `public/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient]: Στέαρ και Πιμελή. Στα κείμενα της κλασικής εποχής, η λέξη πιμελή δήλωνε το μαλακό λίπος, ενώ το στέαρ αναφερόταν στο σκληρό, καθαρό λίπος βοοειδών και αιγοπροβάτων. Στο Ιπποκρατικό Σώμα (Corpus Hippocraticum, 5ος–4ος αι. π.Χ.), το στέαρ καταγράφεται συστηματικά ως βασικό συστατικό σε μαλακτικά καταπλάσματα και επουλωτικές αλοιφές για εγκαύματα, πληγές και ξηροδερμία.
- `public/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient,sensory]: Οίσυπος (Η αρχαία λανολίνη). Ο φαρμακολόγος Πεδάνιος Διοσκουρίδης (1ος αι. μ.Χ.), στο μνημειώδες έργο του Περί ύλης ιατρικής (Λόγος Β', κεφ. 74), αφιερώνει εκτενές λήμμα στον οίσυπο. Πρόκειται για το λίπος που εξαγόταν από το άπλυτο μαλλί των προβάτων. Ο Διοσκουρίδης και αργότερα ο Γαληνός (2ος αι. μ.Χ.) το συνιστούσαν για τη λείανση των ρυτίδων, την αποκατάσταση του ερεθισμένου δέρματος και τη θρέψη της επιδερμίδας.
- `public/blog/hippocrates-tallow-mastic.html:3` — `h2` [ingredient]: 2. Μαστίχα Χίου: Τα «Δάκρυα» που Χάριζαν Λάμψη
- `public/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: Ενώ το ζωικό λίπος προσέφερε τη δομή και τη βαθιά ενυδάτωση, οι αρχαίοι Έλληνες αναζητούσαν φυσικά συντηρητικά και δραστικά συστατικά που θα θωράκιζαν το δέρμα. Η απάντηση βρισκόταν στη νότια Χίο.
- `public/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient]: Η καταγραφή του Διοσκουρίδη. Στο Περί ύλης ιατρικής (Λόγος Α', κεφ. 70, λήμμα Σχίνος και Μαστίχη), ο Διοσκουρίδης εξυμνεί τη ρητίνη της Χίου για τις στυπτικές, μαλακτικές και καθαριστικές της ιδιότητες, σημειώνοντας ότι «χαρίζει λάμψη στο δέρμα».
- `public/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient]: Η μαρτυρία του Ηροδότου και του Θεόφραστου. Ήδη από τον 5ο αιώνα π.Χ., ο Ηρόδοτος αναφέρει τη συλλογή της ρητίνης, ενώ ο Θεόφραστος στο έργο του Περί φυτών ιστορίας περιγράφει τη μοναδικότητα του μαστιχοφόρου σχίνου (Pistacia lentiscus var. chia).
- `public/blog/hippocrates-tallow-mastic.html:3` — `p` [sensory]: Οι αρχαίοι μυρεψοί (παρασκευαστές αρωμάτων και καλλυντικών) ακολουθούσαν αυστηρά πρωτόκολλα καθαρισμού, ώστε οι αλοιφές τους να μην ταγγίζουν και να μην έχουν βαριά οσμή:
- `public/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: 1. Τήξη και Κάθαρση (Purification). Όπως περιγράφει ο Διοσκουρίδης, έλιωναν το ωμό στέαρ σε χαμηλή φωτιά, το σούρωναν μέσα από λινά υφάσματα και το «έπλεναν» επανειλημμένα με καθαρό νερό ή κρασί. Αυτό απομάκρυνε τις πρωτεΐνες και άφηνε μόνο το αγνό, άοσμο λιπίδιο.
- `public/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient,sensory]: 2. Εκχύλιση εν θερμώ (Infusion). Στο καθαρισμένο λίπος πρόσθεταν τριμμένη μαστίχα Χίου, μελισσοκέρι, ρίζα ίριδας ή ροδοπέταλα. Η μαστίχα δεν έδινε μόνο υπέροχο άρωμα, αλλά δρούσε και ως ισχυρός αντιμικροβιακός παράγοντας που διατηρούσε την κρέμα αναλλοίωτη για μήνες.
- `public/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient]: Το μυστικό των Βυζαντινών Αυτοκρατειρών. Αιώνες μετά την κλασική αρχαιότητα, οι βυζαντινοί αυτοκρατορικοί ιατροί Ορειβάσιος (4ος αι. μ.Χ.) και Αέτιος ο Αμιδηνός (6ος αι. μ.Χ.) συνέχιζαν να συνταγογραφούν αλοιφές με βάση το ζωικό λίπος και τη μαστίχα Χίου στις αυτοκράτειρες της Κωνσταντινούπολης για τη διατήρηση της νεότητας.
- `public/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient]: Η πρώτη «Κρέμα Γαληνού» (Cold Cream). Ο Γαληνός δημιούργησε το Ceratum Galeni, την πρώτη ενυδατική κρέμα στην ιστορία, αναμειγνύοντας ζωικό λίπος ή ελαιόλαδο με μελισσοκέρι και ροδόνερο — μια φόρμουλα που διδάσκεται ακόμα και σήμερα στη φαρμακευτική.
- `public/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: Η επιστήμη σήμερα επιβεβαιώνει αυτό που ο Ιπποκράτης και ο Διοσκουρίδης γνώριζαν εμπειρικά. Το beef tallow (μοσχαρίσιο λίπος) έχει λιπιδικό προφίλ σχεδόν ταυτόσημο με το ανθρώπινο σμήγμα, πλούσιο σε λιποδιαλυτές βιταμίνες A, D, E και K. Παράλληλα, ο Ευρωπαϊκός Οργανισμός Φαρμάκων (EMA) έχει αναγνωρίσει επίσημα τη μαστίχα Χίου ως παραδοσιακό φάρμακο φυτικής προέλευσης για τις φλεγμονές του δέρματος και την επούλωση μικροτραυματισμών.
- `public/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient,count,sensory]: Το PRIMAL CORE αναβιώνει αυτή ακριβώς την αρχαιοελληνική τεχνογνωσία. Χωρίς 30 ακατανόητα χημικά συστατικά, χωρίς τεχνητά αρώματα και χωρίς περιττά πρόσθετα, ενώνουμε την καθαρή βάση του beef tallow με αυθεντική μαστίχα Χίου.
- `public/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient]: Μετά το ξύρισμα. Καταπραΰνει άμεσα τους μικροερεθισμούς χάρη στη ρητίνη της μαστίχας.
- `public/blog/hippocrates-tallow-mastic.html:3` — `li` [sensory]: Στην ξηρή επιδερμίδα. Απορροφάται χωρίς να αφήνει λιπαρότητα, επαναφέροντας το δέρμα στην πιο ανθεκτική εκδοχή του.
- `public/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: 1. Ιπποκράτης, Περί ελκών & Περί γυναικείων (Corpus Hippocraticum, 5ος–4ος αι. π.Χ.) — Αναφορές στη χρήση του στέατος σε επουλωτικά και μαλακτικά σκευάσματα.
- `public/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: 2. Πεδάνιος Διοσκουρίδης, Περί ύλης ιατρικής (De Materia Medica, 1ος αι. μ.Χ.) — Λόγος Α', κεφ. 70 (Σχίνος / Μαστίχη) και Λόγος Β', κεφ. 74–76 (Οίσυπος και Στέαρ).
- `public/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: 3. Γαληνός, Περί συνθέσεως φαρμάκων των κατά τόπους (2ος αι. μ.Χ.) — Καταγραφή μαλακτικών αλοιφών με βάση το ζωικό λίπος και τις ρητίνες.
- `public/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: 4. European Medicines Agency (EMA), Community herbal monograph on Pistacia lentiscus L., resin (mastix) (2015) — Επίσημη αναγνώριση για δερματικές φλεγμονές και επούλωση πληγών.

### public/blog/index.html — 16 matching locations

- `public/blog/index.html:3` — `meta@content` [ingredient]: Διάβασε για το βόειο στέαρ, τα συστατικά και την απλή καθημερινή περιποίηση.
- `public/blog/index.html:3` — `img@alt` [ingredient]: Χρυσαφένια δάκρυα μαστίχας πάνω σε σκοτεινή πέτρα
- `public/blog/index.html:3` — `h2` [ingredient]: Μαστίχα Χίου: Το φυσικό συστατικό με 2.500 χρόνια ιστορίας που επιστρέφει στην περιποίηση του προσώπου
- `public/blog/index.html:3` — `h2` [ingredient]: Από τον Ιπποκράτη στο PRIMAL CORE: Η Ξεχασμένη Ιστορία του Βόειου Στέαρ και της Μαστίχας Χίου στην Αρχαία Ελλάδα
- `public/blog/index.html:3` — `img@alt` [ingredient]: Τι είναι το βόειο λίπος (beef tallow);
- `public/blog/index.html:3` — `h2` [ingredient]: Τι είναι το βόειο λίπος (beef tallow);
- `public/blog/index.html:3` — `img@alt` [ingredient]: Η Επιστήμη Πίσω από το Beef Tallow: Λιπαρά Οξέα, Βιταμίνες και Περιποίηση της Επιδερμίδας
- `public/blog/index.html:3` — `h2` [ingredient]: Η Επιστήμη Πίσω από το Beef Tallow: Λιπαρά Οξέα, Βιταμίνες και Περιποίηση της Επιδερμίδας
- `public/blog/index.html:3` — `img@alt` [ingredient]: Γιατί το Beef Tallow γίνεται μία από τις πιο πολυσυζητημένες τάσεις στην περιποίηση προσώπου το 2026
- `public/blog/index.html:3` — `h2` [ingredient]: Γιατί το Beef Tallow γίνεται μία από τις πιο πολυσυζητημένες τάσεις στην περιποίηση προσώπου το 2026
- `public/blog/index.html:3` — `img@alt` [ingredient]: Ανοιχτό δοχείο PRIMAL CORE Beef Tallow & Mastic 50 ml με βάλσαμο και μαστίχα
- `public/blog/index.html:3` — `h2` [ingredient]: Beef Tallow: Η επιστροφή στις ρίζες της περιποίησης
- `public/blog/index.html:3` — `img@alt` [ingredient]: Beef Tallow στο Πρόσωπο: Είναι Ασφαλές και Πώς Χρησιμοποιείται;
- `public/blog/index.html:3` — `h2` [ingredient]: Beef Tallow στο Πρόσωπο: Είναι Ασφαλές και Πώς Χρησιμοποιείται;
- `public/blog/index.html:3` — `img@alt` [ingredient]: 30 Ημέρες με Beef Tallow: Τι Μπορεί να Αλλάξει στο Πρόσωπό σου;
- `public/blog/index.html:3` — `h2` [ingredient]: 30 Ημέρες με Beef Tallow: Τι Μπορεί να Αλλάξει στο Πρόσωπό σου;

### public/blog/tallow-safety.html — 58 matching locations

- `public/blog/tallow-safety.html:3` — `title` [ingredient]: Beef Tallow στο Πρόσωπο: Είναι Ασφαλές και Πώς Χρησιμοποιείται; \| PRIMAL CORE
- `public/blog/tallow-safety.html:3` — `meta@content` [ingredient]: Μπορείς να χρησιμοποιείς beef tallow καθημερινά στο πρόσωπό σου; Τι προσφέρει στην επιδερμίδα και τι πρέπει να γνωρίζεις πριν το δοκιμάσεις;
- `public/blog/tallow-safety.html:3` — `meta@content` [ingredient]: Beef Tallow στο Πρόσωπο: Είναι Ασφαλές και Πώς Χρησιμοποιείται; \| PRIMAL CORE
- `public/blog/tallow-safety.html:3` — `h1` [ingredient]: Beef Tallow στο Πρόσωπο: Είναι Ασφαλές και Πώς Χρησιμοποιείται;
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Μπορείς να χρησιμοποιείς beef tallow καθημερινά στο πρόσωπό σου; Τι προσφέρει στην επιδερμίδα και τι πρέπει να γνωρίζεις πριν το δοκιμάσεις;
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Το beef tallow επιστρέφει δυναμικά στον κόσμο της περιποίησης.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Από παραδοσιακή πρώτη ύλη, εξελίσσεται σε συστατικό σύγχρονων προϊόντων skincare.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: «Μπορώ πραγματικά να βάζω ζωικό λίπος στο πρόσωπό μου;»
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Η σύντομη απάντηση είναι ναι. Το κατάλληλα επεξεργασμένο beef tallow μπορεί να χρησιμοποιηθεί ως συστατικό καλλυντικών προσώπου.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Αυτό, βέβαια, δεν σημαίνει ότι το ακατέργαστο ζωικό λίπος είναι κατάλληλο για εφαρμογή στο δέρμα ή ότι κάθε προϊόν με tallow ταιριάζει σε όλους.
- `public/blog/tallow-safety.html:3` — `h2` [ingredient]: 1. Τι είναι το Beef Tallow και γιατί χρησιμοποιείται στο πρόσωπο;
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Το beef tallow είναι καθαρισμένο λίπος βοοειδών, το οποίο προκύπτει μέσω κατάλληλης επεξεργασίας.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Αποτελείται κυρίως από τριγλυκερίδια που περιέχουν λιπαρά οξέα, όπως:
- `public/blog/tallow-safety.html:3` — `li` [ingredient]: Ελαϊκό οξύ (Oleic Acid): Συμβάλλει στη μαλακτική συμπεριφορά των λιπαρών συνθέσεων.
- `public/blog/tallow-safety.html:3` — `li` [ingredient]: Παλμιτικό οξύ (Palmitic Acid): Συναντάται επίσης στο φυσικό σμήγμα του δέρματος.
- `public/blog/tallow-safety.html:3` — `li` [ingredient,sensory]: Στεατικό οξύ (Stearic Acid): Συμβάλλει στη δομή και στη χαρακτηριστική υφή ενός balm.
- `public/blog/tallow-safety.html:3` — `p` [ingredient,sensory]: Τα λιπαρά αυτά συστατικά μπορούν να βοηθήσουν την επιδερμίδα να αισθάνεται πιο απαλή και να περιορίσουν την απώλεια υγρασίας από την επιφάνειά της.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Αυτός είναι ένας από τους λόγους που το beef tallow έχει ενδιαφέρον ως βάση για προϊόντα περιποίησης.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Δεν χρειάζεται να πιστέψεις ότι πρόκειται για θαυματουργό συστατικό.
- `public/blog/tallow-safety.html:3` — `h2` [ingredient]: 2. Είναι ασφαλές το Beef Tallow για το πρόσωπο;
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Το beef tallow μπορεί να χρησιμοποιηθεί σε καλλυντικά προϊόντα προσώπου, εφόσον η πρώτη ύλη έχει την κατάλληλη ποιότητα και η τελική σύνθεση έχει αξιολογηθεί ως ασφαλής για την προβλεπόμενη χρήση της.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Αυτό είναι διαφορετικό από το να απλώσεις απευθείας στο πρόσωπό σου οποιοδήποτε ζωικό λίπος.
- `public/blog/tallow-safety.html:3` — `li` [sensory]: Οι απαιτούμενοι έλεγχοι ασφάλειας.
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Ένα πλούσιο balm μπορεί να είναι ευχάριστο για κάποιον που αντιμετωπίζει ξηρότητα, αλλά να φαίνεται πολύ βαρύ σε κάποιον με ιδιαίτερα λιπαρή επιδερμίδα.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Το σωστό ερώτημα δεν είναι αν το beef tallow είναι κατάλληλο για όλους. Είναι αν η συγκεκριμένη σύνθεση είναι κατάλληλη για τις ανάγκες του δικού σου δέρματος.
- `public/blog/tallow-safety.html:3` — `h2` [ingredient]: 3. Σε ποιες ανάγκες μπορεί να βοηθήσει ένα Tallow Face Balm;
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Η χρήση ενός κατάλληλου μαλακτικού προϊόντος μπορεί να περιορίσει αυτή την αίσθηση, δημιουργώντας ένα προστατευτικό λιπαρό στρώμα στην επιφάνεια της επιδερμίδας.
- `public/blog/tallow-safety.html:3` — `h3` [sensory]: Τραχιά υφή
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Ένα μαλακτικό balm μπορεί να βοηθήσει το δέρμα να αισθάνεται πιο απαλό και λείο.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Αυτό δεν σημαίνει ότι το tallow εξαφανίζει ρυτίδες ή αντιστρέφει τη γήρανση.
- `public/blog/tallow-safety.html:3` — `h2` [sensory]: 4. Είναι κατάλληλο για λιπαρό δέρμα ή δέρμα με ακμή;
- `public/blog/tallow-safety.html:3` — `p` [ingredient,sensory]: Το beef tallow είναι μια πλούσια λιπαρή πρώτη ύλη.
- `public/blog/tallow-safety.html:3` — `p` [ingredient,sensory]: Ορισμένοι άνθρωποι μπορεί να ανέχονται καλά μια σύνθεση που περιέχει tallow, ενώ άλλοι μπορεί να τη βρίσκουν υπερβολικά βαριά.
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Εάν έχεις λιπαρό δέρμα, τάση για φραγμένους πόρους ή ενεργή ακμή, χρειάζεται ιδιαίτερη προσοχή στην επιλογή προϊόντος.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Φυσικό συστατικό δεν σημαίνει αυτόματα κατάλληλο για κάθε τύπο δέρματος.
- `public/blog/tallow-safety.html:3` — `h2` [ingredient]: 5. Πώς χρησιμοποιείται ένα Tallow Face Balm στο πρόσωπο;
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Βήμα 3 — Άπλωσε απαλά.
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Η εφαρμογή σε ελαφρώς νωπή επιδερμίδα μπορεί να βοηθήσει στη διατήρηση της υπάρχουσας υγρασίας, καθώς ένα άνυδρο balm δεν προσθέτει από μόνο του νερό στο δέρμα.
- `public/blog/tallow-safety.html:3` — `h2` [ingredient]: 6. Μπορείς να χρησιμοποιήσεις Beef Tallow και στο σώμα;
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Ναι, το beef tallow χρησιμοποιείται επίσης σε προϊόντα περιποίησης σώματος.
- `public/blog/tallow-safety.html:3` — `h2` [sensory]: 7. Θα αφήνει το πρόσωπό μου λιπαρό;
- `public/blog/tallow-safety.html:3` — `p` [ingredient,sensory]: Το beef tallow έχει από τη φύση του πλούσια, λιπαρή σύσταση.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Η τελική αίσθηση, όμως, ενός balm εξαρτάται και από τα υπόλοιπα συστατικά, τις αναλογίες τους και τη διαδικασία παρασκευής.
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Μια προσεκτικά σχεδιασμένη σύνθεση μπορεί να στοχεύει σε καλύτερη απλωσιμότητα και λιγότερο βαριά αίσθηση.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Αυτό δεν εξασφαλίζεται απλώς επειδή το προϊόν περιέχει tallow.
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Ένας από τους βασικούς στόχους ανάπτυξής μας είναι να δημιουργήσουμε ένα balm που δεν θα θυμίζει την υπερβολικά βαριά αίσθηση ορισμένων παραδοσιακών λιπαρών προϊόντων.
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Θέλουμε μια σύνθεση που απλώνεται εύκολα, προσφέρει μαλακτική φροντίδα και εντάσσεται στην καθημερινότητα χωρίς περιττή ταλαιπωρία.
- `public/blog/tallow-safety.html:3` — `h2` [ingredient]: 8. Γιατί επιλέξαμε το Beef Tallow για το PRIMAL CORE
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Δεν επιλέξαμε το beef tallow επειδή πιστεύουμε ότι είναι καλύτερο από κάθε σύγχρονο καλλυντικό συστατικό.
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Το επιλέξαμε ως μια ενδιαφέρουσα, παραδοσιακή λιπαρή βάση πάνω στην οποία μπορούμε να αναπτύξουμε ένα σύγχρονο προϊόν.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Λίγα συστατικά. Κάθε πρώτη ύλη πρέπει να εξυπηρετεί συγκεκριμένο σκοπό.
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Χωρίς προσθήκη νερού. Μια άνυδρη σύνθεση με επίκεντρο τη μαλακτική περιποίηση.
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Χωρίς συνθετικό άρωμα. Για μια πιο διακριτική εμπειρία χρήσης.
- `public/blog/tallow-safety.html:3` — `p` [sensory]: Έμφαση στην υφή. Γιατί ένα προϊόν που δεν είναι ευχάριστο στην εφαρμογή δύσκολα γίνεται καθημερινή συνήθεια.
- `public/blog/tallow-safety.html:3` — `h2` [ingredient]: Το συμπέρασμα: Μπορείς να χρησιμοποιείς Beef Tallow στο πρόσωπό σου;
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Το beef tallow διαθέτει λιπαρά συστατικά με μαλακτικές ιδιότητες και μπορεί να αποτελέσει τη βάση ενός προϊόντος καθημερινής περιποίησης.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Αναπτύσσουμε ένα ανδρικό face balm με βάση το beef tallow.
- `public/blog/tallow-safety.html:3` — `p` [ingredient]: Με λίγα επιλεγμένα συστατικά και στόχο την απλή, καθημερινή μαλακτική φροντίδα του προσώπου.

### public/blog/tallow-science.html — 86 matching locations

- `public/blog/tallow-science.html:3` — `title` [ingredient]: Η Επιστήμη Πίσω από το Beef Tallow: Λιπαρά Οξέα, Βιταμίνες και Περιποίηση της Επιδερμίδας \| PRIMAL CORE
- `public/blog/tallow-science.html:3` — `meta@content` [ingredient]: Τι πραγματικά περιέχει το beef tallow, πώς λειτουργούν τα συστατικά του και γιατί επιστρέφει στη σύγχρονη περιποίηση προσώπου;
- `public/blog/tallow-science.html:3` — `meta@content` [ingredient]: Η Επιστήμη Πίσω από το Beef Tallow: Λιπαρά Οξέα, Βιταμίνες και Περιποίηση της Επιδερμίδας \| PRIMAL CORE
- `public/blog/tallow-science.html:3` — `h1` [ingredient]: Η Επιστήμη Πίσω από το Beef Tallow: Λιπαρά Οξέα, Βιταμίνες και Περιποίηση της Επιδερμίδας
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Τι πραγματικά περιέχει το beef tallow, πώς λειτουργούν τα συστατικά του και γιατί επιστρέφει στη σύγχρονη περιποίηση προσώπου;
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Υπάρχει ένας λόγος που το beef tallow χρησιμοποιείται στην περιποίηση του δέρματος εδώ και γενιές.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Το beef tallow, δηλαδή το καθαρισμένο λίπος βοοειδών, περιέχει έναν ιδιαίτερο συνδυασμό λιπαρών οξέων που χρησιμοποιούνται και στη σύγχρονη κοσμετολογία.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Ελαϊκό οξύ. Στεατικό οξύ. Παλμιτικό οξύ.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Τρία συστατικά με διαφορετικές φυσικοχημικές ιδιότητες, που μπορούν να συμβάλουν στη μαλακτική δράση μιας καλλυντικής σύνθεσης.
- `public/blog/tallow-science.html:3` — `h2` [ingredient]: 1. Το μυστικό βρίσκεται στα λιπαρά οξέα
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Το beef tallow αποτελείται κυρίως από τριγλυκερίδια, δηλαδή μόρια που περιλαμβάνουν λιπαρά οξέα.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Συνήθως περιλαμβάνει περίπου 46–55% κορεσμένα λιπαρά οξέα, με σημαντικό ποσοστό μονοακόρεστων λιπαρών.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Τρία από τα κυριότερα λιπαρά οξέα του είναι:
- `public/blog/tallow-science.html:3` — `h3` [ingredient]: Ελαϊκό οξύ (Oleic Acid)
- `public/blog/tallow-science.html:3` — `p` [ingredient,sensory]: Το ελαϊκό οξύ είναι ένα μονοακόρεστο λιπαρό οξύ που συναντάμε επίσης στο ελαιόλαδο και σε άλλα φυσικά έλαια.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Στα καλλυντικά, τα συστατικά που το περιέχουν μπορούν να συμβάλουν στη μαλακή και ελαστική αίσθηση της επιδερμίδας.
- `public/blog/tallow-science.html:3` — `p` [ingredient,sensory]: Το ελεύθερο ελαϊκό οξύ μπορεί επίσης να επηρεάσει τη διαπερατότητα της εξωτερικής στιβάδας του δέρματος. Αυτό δεν σημαίνει ότι οποιοδήποτε προϊόν με ελαϊκό οξύ απορροφάται αυτόματα καλύτερα ή ότι είναι κατάλληλο για όλους τους τύπους δέρματος.
- `public/blog/tallow-science.html:3` — `h3` [ingredient]: Παλμιτικό οξύ (Palmitic Acid)
- `public/blog/tallow-science.html:3` — `p` [sensory]: Ένα λιπαρό οξύ που συναντάμε και στο φυσικό σμήγμα του δέρματος.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Το παλμιτικό οξύ είναι από τα σημαντικά λιπαρά οξέα του beef tallow.
- `public/blog/tallow-science.html:3` — `p` [sensory]: Υπάρχει επίσης στο ανθρώπινο σμήγμα, το φυσικό λιπαρό έκκριμα που συμβάλλει στην προστασία και στη λίπανση της επιφάνειας του δέρματος.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Στην κοσμετολογία χρησιμοποιείται, μεταξύ άλλων, ως συστατικό που μπορεί να συμβάλει στη δομή και στη μαλακτική αίσθηση μιας σύνθεσης.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Η παρουσία του, ωστόσο, δεν σημαίνει ότι το beef tallow έχει ακριβώς την ίδια σύνθεση με το ανθρώπινο σμήγμα.
- `public/blog/tallow-science.html:3` — `h3` [ingredient]: Στεατικό οξύ (Stearic Acid)
- `public/blog/tallow-science.html:3` — `p` [sensory]: Δομή, σταθερότητα και πλούσια υφή.
- `public/blog/tallow-science.html:3` — `p` [ingredient,sensory]: Το στεατικό οξύ είναι ένα κορεσμένο λιπαρό οξύ με ιδιαίτερη σημασία στη σύνθεση καλλυντικών.
- `public/blog/tallow-science.html:3` — `p` [sensory]: Συμβάλλει στη διαμόρφωση της υφής και μπορεί να προσφέρει πιο πλούσια, σταθερή αίσθηση σε μια κρέμα ή ένα balm.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Η παρουσία του στο beef tallow αποτελεί έναν από τους λόγους που το υλικό έχει χαρακτηριστική ημιστερεή έως στερεή σύσταση σε θερμοκρασία δωματίου.
- `public/blog/tallow-science.html:3` — `p` [ingredient,sensory]: Ότι το beef tallow διαθέτει μια ενδιαφέρουσα λιπαρή βάση για προϊόντα που στοχεύουν στη μαλακτική φροντίδα και στη μείωση της αίσθησης ξηρότητας.
- `public/blog/tallow-science.html:3` — `h2` [ingredient]: 2. Βιταμίνες A, D, E και K: Τι πραγματικά περιέχει το tallow;
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Ένα από τα συχνότερα επιχειρήματα υπέρ του beef tallow είναι ότι περιέχει λιποδιαλυτές βιταμίνες.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Πράγματι, ανάλογα με την πρώτη ύλη και την επεξεργασία της, μπορούν να υπάρχουν μικρές ή μεταβλητές ποσότητες βιταμινών.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Αλλά υπάρχει μεγάλη διαφορά ανάμεσα στο να περιέχει ένα συστατικό κάποια βιταμίνη και στο να προσφέρει κλινικά αποδεδειγμένα αποτελέσματα μέσω της εφαρμογής στο δέρμα.
- `public/blog/tallow-science.html:3` — `h3` [ingredient]: Βιταμίνη A
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Η βιταμίνη A και τα παράγωγά της παίζουν σημαντικό ρόλο στη βιολογία της επιδερμίδας.
- `public/blog/tallow-science.html:3` — `p` [sensory]: Ορισμένα ρετινοειδή χρησιμοποιούνται στην κοσμετολογία και στη δερματολογία για τη βελτίωση της εμφάνισης των λεπτών γραμμών και της υφής του δέρματος.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Ωστόσο, η φυσική παρουσία μικρών ποσοτήτων βιταμίνης A στο beef tallow δεν το καθιστά ισοδύναμο με ένα προϊόν ρετινόλης.
- `public/blog/tallow-science.html:3` — `h3` [ingredient]: Βιταμίνη D
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Η βιταμίνη D συμμετέχει σε σημαντικές βιολογικές διαδικασίες του δέρματος, μεταξύ των οποίων η κυτταρική διαφοροποίηση και η ανοσολογική λειτουργία.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Αυτό δεν αποδεικνύει ότι η εφαρμογή beef tallow παρέχει επαρκή βιταμίνη D ώστε να επιφέρει αντίστοιχα αποτελέσματα.
- `public/blog/tallow-science.html:3` — `h3` [ingredient]: Βιταμίνη E
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Η βιταμίνη E είναι γνωστή για την αντιοξειδωτική της δράση.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Στην κοσμετολογία χρησιμοποιείται τόσο για την προστασία λιπαρών συστατικών από την οξείδωση όσο και σε συνθέσεις περιποίησης της επιδερμίδας.
- `public/blog/tallow-science.html:3` — `h3` [ingredient]: Βιταμίνη K
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Η βιταμίνη K συμμετέχει φυσιολογικά σε διαδικασίες όπως η πήξη του αίματος.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Δεν έχει όμως αποδειχθεί ότι η μικρή ποσότητα βιταμίνης K που ενδέχεται να υπάρχει στο beef tallow μειώνει τους μαύρους κύκλους ή τις ευρυαγγείες.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Οι βιταμίνες έχουν γνωστούς βιολογικούς ρόλους. Αυτό δεν σημαίνει ότι το beef tallow τις παρέχει στο δέρμα σε ποσότητες που εξασφαλίζουν τα ίδια αποτελέσματα.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Η ποιότητα ενός προϊόντος περιποίησης δεν καθορίζεται από το πόσα θρεπτικά συστατικά αναφέρουμε στην περιγραφή του.
- `public/blog/tallow-science.html:3` — `p` [sensory]: Καθορίζεται από τη συνολική σύνθεση, τη σταθερότητα, την ασφάλεια και την τεκμηριωμένη λειτουργία του.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Για να καταλάβουμε τον ρόλο των λιπαρών συστατικών στην περιποίηση, πρέπει πρώτα να καταλάβουμε πώς λειτουργεί το δέρμα.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Ανάμεσα στα κύτταρά της υπάρχουν λιπίδια, με κυριότερα τα κεραμίδια, τη χοληστερόλη και τα ελεύθερα λιπαρά οξέα.
- `public/blog/tallow-science.html:3` — `p` [sensory]: Αυτή η οργάνωση βοηθά να περιορίζεται η απώλεια νερού από την επιδερμίδα.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Τα κατάλληλα μαλακτικά και προστατευτικά συστατικά μπορούν να βοηθήσουν την επιδερμίδα να διατηρεί καλύτερα την υγρασία της.
- `public/blog/tallow-science.html:3` — `p` [ingredient,sensory]: Το beef tallow, λόγω της λιπαρής του φύσης, μπορεί να χρησιμοποιηθεί ως συστατικό μιας τέτοιας σύνθεσης.
- `public/blog/tallow-science.html:3` — `h2` [ingredient]: 4. Grass-fed beef tallow: Είναι πραγματικά διαφορετικό;
- `public/blog/tallow-science.html:3` — `p` [sensory]: Η διατροφή του ζώου μπορεί να επηρεάσει τη λιπαρή σύσταση των ιστών του.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Το λίπος βοοειδών που εκτρέφονται σε βοσκότοπους μπορεί, για παράδειγμα, να παρουσιάζει διαφορετικές συγκεντρώσεις ορισμένων λιπαρών οξέων, όπως το συζευγμένο λινολεϊκό οξύ, γνωστό ως CLA.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Αυτό, όμως, δεν επιτρέπει να συμπεράνουμε ότι μια κρέμα με grass-fed beef tallow αντιμετωπίζει το έκζεμα, τη ροδόχρου ακμή ή άλλες δερματικές παθήσεις.
- `public/blog/tallow-science.html:3` — `h2` [ingredient]: 5. Beef tallow ή φυτικά έλαια; Δεν είναι τόσο απλό.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Συχνά παρουσιάζεται το beef tallow ως ανώτερο από όλα τα φυτικά έλαια.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Κάθε έλαιο έχει το δικό του προφίλ λιπαρών συστατικών και διαφορετική συμπεριφορά μέσα σε μια καλλυντική σύνθεση.
- `public/blog/tallow-science.html:3` — `p` [ingredient,sensory]: Beef tallow: Περιέχει σημαντικές ποσότητες ελαϊκού, παλμιτικού και στεατικού οξέος. Χρησιμοποιείται ως πλούσια λιπαρή βάση με μαλακτικές ιδιότητες.
- `public/blog/tallow-science.html:3` — `p` [ingredient,sensory]: Jojoba: Αποτελείται κυρίως από υγρούς κηρούς, με ιδιαίτερη αίσθηση κατά την εφαρμογή. Χρησιμοποιείται συχνά για τη βελτίωση της υφής και της απλωσιμότητας.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Έλαιο αργκάν: Περιέχει κυρίως ελαϊκό και λινελαϊκό οξύ, μαζί με άλλα συστατικά που το καθιστούν δημοφιλές στην περιποίηση.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Έλαιο καρύδας: Έχει υψηλή περιεκτικότητα σε λαυρικό οξύ και έντονα μαλακτική συμπεριφορά, αν και δεν ταιριάζει σε κάθε τύπο επιδερμίδας.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Το ζητούμενο δεν είναι ποιο συστατικό θα ανακηρύξουμε νικητή.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Είναι πώς διαφορετικά συστατικά μπορούν να συνεργαστούν για τη δημιουργία μιας καλύτερης συνολικής σύνθεσης.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Δεν πιστεύουμε ότι το beef tallow χρειάζεται να αποκλείει κάθε άλλο συστατικό.
- `public/blog/tallow-science.html:3` — `h2` [ingredient,sensory]: 6. Απορρόφηση: Γιατί η σωστή σύνθεση μετράει περισσότερο από ένα μόνο συστατικό
- `public/blog/tallow-science.html:3` — `p` [ingredient,sensory]: Ένα συνηθισμένο επιχείρημα είναι ότι το beef tallow απορροφάται αμέσως επειδή μοιάζει με το ανθρώπινο σμήγμα.
- `public/blog/tallow-science.html:3` — `p` [sensory]: Η αίσθηση απορρόφησης εξαρτάται από πολλούς παράγοντες:
- `public/blog/tallow-science.html:3` — `li` [ingredient]: Τη συγκέντρωση και τις αναλογίες των λιπαρών συστατικών.
- `public/blog/tallow-science.html:3` — `li` [sensory]: Την υφή και τη θερμοκρασία τήξης της σύνθεσης.
- `public/blog/tallow-science.html:3` — `p` [sensory]: Να δημιουργεί βαριά αίσθηση.
- `public/blog/tallow-science.html:3` — `p` [sensory]: Ο στόχος μας είναι ένα face balm με ευχάριστη εφαρμογή, μαλακτική φροντίδα και όσο το δυνατόν πιο διακριτική λιπαρή αίσθηση.
- `public/blog/tallow-science.html:3` — `li` [ingredient]: Το beef tallow περιέχει λιπαρά οξέα που χρησιμοποιούνται στην κοσμετολογία.
- `public/blog/tallow-science.html:3` — `li` [ingredient]: Το beef tallow είναι ανώτερο από όλες τις συμβατικές ενυδατικές.
- `public/blog/tallow-science.html:3` — `li` [ingredient,sensory]: Οι φυσικά υπάρχουσες βιταμίνες του απορροφώνται σε κλινικά αποτελεσματικές ποσότητες.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Ούτε επειδή θεωρούμε ότι κάθε συνθετικό συστατικό είναι κακό.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Μπορούμε να δημιουργήσουμε ένα απλό, σύγχρονο προϊόν περιποίησης, χρησιμοποιώντας το beef tallow ως βασική πρώτη ύλη;
- `public/blog/tallow-science.html:3` — `p` [sensory]: Που θέλει το πρόσωπό του να δείχνει πιο λείο και περιποιημένο.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Μια επιλεγμένη σύνθεση με λίγα συστατικά.
- `public/blog/tallow-science.html:3` — `p` [sensory]: Χωρίς προσθήκη νερού.
- `public/blog/tallow-science.html:3` — `p` [sensory]: Χωρίς συνθετικό άρωμα.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: Δεν χρειάζεται να γνωρίζεις τι είναι το ελαϊκό ή το στεατικό οξύ για να περιποιείσαι το πρόσωπό σου.
- `public/blog/tallow-science.html:3` — `p` [ingredient]: PRIMAL CORE — ANCESTRAL INGREDIENTS. MODERN FORMULATION.

### public/blog/tallow-skincare.html — 48 matching locations

- `public/blog/tallow-skincare.html:3` — `title` [ingredient]: Γιατί το Beef Tallow γίνεται μία από τις πιο πολυσυζητημένες τάσεις στην περιποίηση προσώπου το 2026 \| PRIMAL CORE
- `public/blog/tallow-skincare.html:3` — `meta@content` [ingredient]: Η επιστροφή σε πιο απλές συνθέσεις, η ανάγκη για λιγότερα προϊόντα και η αναζήτηση ουσιαστικής ενυδάτωσης φέρνουν ένα παραδοσιακό συστατικό ξανά στο προσκήνιο.
- `public/blog/tallow-skincare.html:3` — `meta@content` [ingredient]: Γιατί το Beef Tallow γίνεται μία από τις πιο πολυσυζητημένες τάσεις στην περιποίηση προσώπου το 2026 \| PRIMAL CORE
- `public/blog/tallow-skincare.html:3` — `h1` [ingredient]: Γιατί το Beef Tallow γίνεται μία από τις πιο πολυσυζητημένες τάσεις στην περιποίηση προσώπου το 2026
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Η επιστροφή σε πιο απλές συνθέσεις, η ανάγκη για λιγότερα προϊόντα και η αναζήτηση ουσιαστικής ενυδάτωσης φέρνουν ένα παραδοσιακό συστατικό ξανά στο προσκήνιο.
- `public/blog/tallow-skincare.html:3` — `img@alt` [ingredient]: Beef tallow και περιποίηση προσώπου
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Οροί, κρέμες, ενεργά συστατικά, πρωινές και βραδινές ρουτίνες. Δεκάδες προϊόντα που υπόσχονται να λύσουν προβλήματα τα οποία, πολλές φορές, δεν γνωρίζαμε καν ότι είχαμε.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Το 2026, η συζήτηση γύρω από την περιποίηση του δέρματος στρέφεται όλο και περισσότερο προς την απλότητα, τη διαφάνεια των συστατικών και την προστασία του φυσικού δερματικού φραγμού.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Και μέσα σε αυτή τη συζήτηση, ένα συστατικό με ιστορία αιώνων επιστρέφει δυναμικά: το beef tallow, δηλαδή το καθαρισμένο ζωικό λίπος βοοειδών που χρησιμοποιείται σε προϊόντα περιποίησης.
- `public/blog/tallow-skincare.html:3` — `li` [sensory]: Ξηρότητα και τραχιά υφή
- `public/blog/tallow-skincare.html:3` — `h3` [ingredient]: Πού ταιριάζει το beef tallow;
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Το beef tallow αποτελείται κυρίως από λιπαρά οξέα, όπως το ελαϊκό, το παλμιτικό και το στεατικό οξύ.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Αυτά τα λιπαρά συστατικά χρησιμοποιούνται ευρέως στην κοσμετολογία για τις μαλακτικές τους ιδιότητες.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Σε μια σωστά σχεδιασμένη σύνθεση, το tallow μπορεί να συμβάλει στη δημιουργία ενός προστατευτικού, μαλακτικού στρώματος στην επιφάνεια του δέρματος, περιορίζοντας την αίσθηση ξηρότητας.
- `public/blog/tallow-skincare.html:3` — `h2` [sensory]: 2. Γιατί η υφή έχει τόσο μεγάλη σημασία
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Οι πρώτες παραδοσιακές συνθέσεις με ζωικό λίπος είχαν ένα σημαντικό μειονέκτημα: την αίσθηση βάρους.
- `public/blog/tallow-skincare.html:3` — `p` [sensory]: Ο σύγχρονος άντρας δεν θέλει να κυκλοφορεί με ένα λιπαρό στρώμα στο πρόσωπό του.
- `public/blog/tallow-skincare.html:3` — `li` [sensory]: Απλώνεται εύκολα.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Η τεχνική παρασκευής, η αναλογία των λιπαρών συστατικών και η συνολική σύνθεση καθορίζουν την τελική εμπειρία.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient,sensory]: Το whipped tallow, για παράδειγμα, αποκτά πιο αέρινη υφή μέσω μηχανικής ανάδευσης. Αυτό μπορεί να βελτιώσει την ευκολία εφαρμογής, χωρίς να σημαίνει απαραίτητα ότι απορροφάται γρηγορότερα.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Στο PRIMAL CORE, ο στόχος δεν είναι απλώς να χρησιμοποιήσουμε beef tallow.
- `public/blog/tallow-skincare.html:3` — `p` [sensory]: Είναι να εξελίξουμε μια παραδοσιακή πρώτη ύλη σε ένα σύγχρονο ανδρικό προϊόν περιποίησης, με ιδιαίτερη έμφαση στην υφή και στην καθημερινή ευκολία.
- `public/blog/tallow-skincare.html:3` — `p` [sensory]: Λιγότερη λιπαρότητα στην αίσθηση. Περισσότερη πρακτικότητα. Καμία περιττή πολυπλοκότητα.
- `public/blog/tallow-skincare.html:3` — `h2` [ingredient]: 3. Grass-fed beef tallow: Γιατί έχει σημασία η προέλευση
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Η προέλευση των συστατικών αποκτά ολοένα μεγαλύτερη σημασία για τους καταναλωτές.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Αυτός είναι ένας λόγος που το grass-fed beef tallow, δηλαδή το λίπος από βοοειδή που έχουν τραφεί με χόρτο, προσελκύει ενδιαφέρον.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Το beef tallow μπορεί να περιέχει λιποδιαλυτές βιταμίνες και διάφορα λιπαρά οξέα. Ωστόσο, οι πραγματικές συγκεντρώσεις εξαρτώνται από την πρώτη ύλη και την επεξεργασία της.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Η προέλευση grass-fed δεν εγγυάται από μόνη της υψηλότερη αποτελεσματικότητα στην επιδερμίδα.
- `public/blog/tallow-skincare.html:3` — `p` [sensory]: Εκείνο που έχει πραγματική σημασία για ένα ποιοτικό καλλυντικό είναι η ελεγχόμενη προμήθεια, η καθαρότητα της πρώτης ύλης, η σταθερότητα και η ασφάλεια της τελικής σύνθεσης.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Face oil.
- `public/blog/tallow-skincare.html:3` — `p` [sensory]: Φυσικό; Βιολογικό; Χωρίς συντηρητικά; Χωρίς άρωμα;
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Ένα φυσικό συστατικό δεν είναι αυτομάτως ασφαλέστερο από ένα συνθετικό. Αντίστοιχα, ένα προϊόν με πολλά συστατικά δεν είναι απαραίτητα χειρότερο από ένα προϊόν με λίγα.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient,sensory]: Αυτό που έχει σημασία είναι η καταλληλότητα κάθε συστατικού, η συγκέντρωσή του και η ασφάλεια της συνολικής σύνθεσης.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Απλή σύνθεση. Περιορισμένος αριθμός συστατικών, με συγκεκριμένο λειτουργικό σκοπό.
- `public/blog/tallow-skincare.html:3` — `p` [sensory]: Χωρίς προσθήκη νερού. Μια άνυδρη σύνθεση, σχεδιασμένη για μαλακτική φροντίδα.
- `public/blog/tallow-skincare.html:3` — `p` [sensory]: Χωρίς συνθετικό άρωμα. Με στόχο μια πιο διακριτική εμπειρία εφαρμογής.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Η τελική επιλογή των συστατικών θα καθοριστεί μετά την ολοκλήρωση της ανάπτυξης και των ελέγχων.
- `public/blog/tallow-skincare.html:3` — `h2` [ingredient]: 6. Beef tallow και λεπτές γραμμές: Τι μπορούμε πραγματικά να περιμένουμε;
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Κανένα συστατικό δεν μπορεί να εξαφανίσει τις ρυτίδες απλώς επειδή είναι φυσικό ή χρησιμοποιείται εδώ και αιώνες.
- `public/blog/tallow-skincare.html:3` — `p` [sensory]: Η κατάλληλη ενυδάτωση και μαλακτική φροντίδα μπορούν να βελτιώσουν προσωρινά την όψη των λεπτών γραμμών αφυδάτωσης, κάνοντας την επιφάνεια του δέρματος να φαίνεται πιο λεία και απαλή.
- `public/blog/tallow-skincare.html:3` — `p` [sensory]: Επιδερμίδα που δείχνει πιο περιποιημένη, με λιγότερη αίσθηση ξηρότητας και πιο λεία εμφάνιση.
- `public/blog/tallow-skincare.html:3` — `h2` [ingredient]: 7. Γιατί αυξάνεται το ενδιαφέρον για το beef tallow;
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Η επανεμφάνιση του beef tallow στην περιποίηση δεν είναι τυχαία.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Επιστροφή στα αναγνωρίσιμα συστατικά. Οι καταναλωτές ενδιαφέρονται περισσότερο για το περιεχόμενο και την προέλευση των προϊόντων τους.
- `public/blog/tallow-skincare.html:3` — `p` [sensory]: Το ενδιαφέρον, όμως, δεν αποτελεί απόδειξη αποτελεσματικότητας. Η αξία κάθε προϊόντος κρίνεται τελικά από την ποιότητα, την ασφάλεια και την εμπειρία χρήσης του.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Γι' αυτό αναπτύσσουμε ένα ανδρικό face balm με βάση το beef tallow, με στόχο να προσφέρει μαλακτική φροντίδα, άνεση και μια ευχάριστη αίσθηση καθημερινής χρήσης.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Η επιστροφή του beef tallow δεν σημαίνει ότι ανακαλύψαμε κάποιο θαυματουργό μυστικό.
- `public/blog/tallow-skincare.html:3` — `p` [ingredient]: Αναπτύσσουμε ένα νέο ανδρικό face balm με βάση το beef tallow.

### public/blog/thirty-days.html — 28 matching locations

- `public/blog/thirty-days.html:3` — `title` [ingredient]: 30 Ημέρες με Beef Tallow: Τι Μπορεί να Αλλάξει στο Πρόσωπό σου; \| PRIMAL CORE
- `public/blog/thirty-days.html:3` — `meta@content` [ingredient]: 30 Ημέρες με Beef Tallow: Τι Μπορεί να Αλλάξει στο Πρόσωπό σου; \| PRIMAL CORE
- `public/blog/thirty-days.html:3` — `h1` [ingredient]: 30 Ημέρες με Beef Tallow: Τι Μπορεί να Αλλάξει στο Πρόσωπό σου;
- `public/blog/thirty-days.html:3` — `img@alt` [ingredient]: 30 Ημέρες με Beef Tallow: Τι Μπορεί να Αλλάξει στο Πρόσωπό σου;
- `public/blog/thirty-days.html:3` — `p` [ingredient,sensory]: Το beef tallow έχει προσελκύσει ενδιαφέρον ως συστατικό περιποίησης, χάρη στη λιπαρή του σύσταση και στις μαλακτικές ιδιότητες που μπορεί να προσφέρει σε ένα κατάλληλα σχεδιασμένο balm.
- `public/blog/thirty-days.html:3` — `p` [sensory]: Πώς απλώνεται στο δέρμα.
- `public/blog/thirty-days.html:3` — `p` [sensory]: Αν αφήνει λιπαρότητα ή αν η υφή του ταιριάζει στις προτιμήσεις σου.
- `public/blog/thirty-days.html:3` — `p` [ingredient]: Το beef tallow αποτελείται κυρίως από λιπαρά συστατικά, όπως το ελαϊκό, το παλμιτικό και το στεατικό οξύ.
- `public/blog/thirty-days.html:3` — `p` [sensory]: Έτσι, ένα balm μπορεί να προσφέρει από την πρώτη εφαρμογή πιο απαλή αίσθηση και να περιορίσει την αίσθηση τραβήγματος που σχετίζεται με την ξηρότητα.
- `public/blog/thirty-days.html:3` — `p` [sensory]: Τι μπορεί να παρατηρήσεις: Πιο απαλή αίσθηση στο δέρμα, ιδιαίτερα εάν αντιμετωπίζεις ξηρότητα.
- `public/blog/thirty-days.html:3` — `p` [sensory]: Παράλληλα, η πρώτη εβδομάδα είναι χρήσιμη για να εντοπίσεις αν κάποιο προϊόν είναι πολύ βαρύ, αν προκαλεί ερεθισμό ή αν δεν ταιριάζει στον τύπο του δέρματός σου.
- `public/blog/thirty-days.html:3` — `p` [sensory]: Αυτός συμβάλλει στον περιορισμό της απώλειας νερού και στην προστασία από εξωτερικούς παράγοντες.
- `public/blog/thirty-days.html:3` — `p` [ingredient]: Δεν σημαίνει ότι το beef tallow επιδιορθώνει βαθιές δερματικές βλάβες ή αντικαθιστά δερματολογικές θεραπείες.
- `public/blog/thirty-days.html:3` — `p` [sensory]: Όταν το δέρμα διατηρεί καλύτερα την υγρασία του, η επιφάνειά του μπορεί να δείχνει πιο λεία.
- `public/blog/thirty-days.html:3` — `p` [ingredient]: Ούτε ότι το beef tallow έχει αποδεδειγμένη δράση αντίστοιχη με εξειδικευμένα αντιγηραντικά δραστικά συστατικά.
- `public/blog/thirty-days.html:3` — `p` [sensory]: Τι μπορεί να παρατηρήσεις: Μια πιο λεία εμφάνιση της ξηρής επιδερμίδας.
- `public/blog/thirty-days.html:3` — `p` [sensory]: Τι μπορεί να αξιολογήσεις μετά από 30 ημέρες: Την άνεση της επιδερμίδας σου, την αίσθηση ξηρότητας, την υφή και το πόσο εύκολα εντάσσεται το προϊόν στην καθημερινότητά σου.
- `public/blog/thirty-days.html:3` — `p` [ingredient]: Δεν υπάρχει εγγύηση ότι το tallow θα επιφέρει συγκεκριμένες αλλαγές μέσα σε 30 ημέρες.
- `public/blog/thirty-days.html:3` — `h2` [ingredient]: Τι δεν πρέπει να περιμένεις από ένα Tallow Balm
- `public/blog/thirty-days.html:3` — `p` [ingredient]: Ένα καλλυντικό με beef tallow δεν έχει αποδειχθεί ότι:
- `public/blog/thirty-days.html:3` — `p` [ingredient]: Το beef tallow είναι μια πρώτη ύλη με ενδιαφέρουσες μαλακτικές ιδιότητες.
- `public/blog/thirty-days.html:3` — `p` [ingredient]: Γι' αυτό αναπτύσσουμε ένα ανδρικό face balm με βάση το beef tallow.
- `public/blog/thirty-days.html:3` — `p` [ingredient]: Με περιορισμένο αριθμό επιλεγμένων συστατικών:
- `public/blog/thirty-days.html:3` — `p` [ingredient]: Beef Tallow. Jojoba Oil. Beeswax. Chios Mastic Oil. Vitamin E.
- `public/blog/thirty-days.html:3` — `p` [ingredient]: Κάθε συστατικό έχει διαφορετικό λειτουργικό ρόλο στη σύνθεση.
- `public/blog/thirty-days.html:3` — `p` [sensory]: Ο στόχος μας είναι ένα balm που να απλώνεται εύκολα, να προσφέρει μαλακτική φροντίδα και να έχει όσο το δυνατόν πιο ευχάριστη αίσθηση στην καθημερινή χρήση.
- `public/blog/thirty-days.html:3` — `p` [ingredient]: Όχι επειδή το beef tallow αποτελεί κάποιο μυστικό της αιώνιας νεότητας.
- `public/blog/thirty-days.html:3` — `p` [ingredient]: PRIMAL CORE — ANCESTRAL INGREDIENTS. MODERN FORMULATION.

### public/blog/what-is-tallow.html — 10 matching locations

- `public/blog/what-is-tallow.html:3` — `title` [ingredient]: Τι είναι το βόειο λίπος (beef tallow); \| PRIMAL CORE
- `public/blog/what-is-tallow.html:3` — `meta@content` [ingredient]: Τι είναι το βόειο λίπος (beef tallow); \| PRIMAL CORE
- `public/blog/what-is-tallow.html:3` — `h1` [ingredient]: Τι είναι το βόειο λίπος (beef tallow);
- `public/blog/what-is-tallow.html:3` — `img@alt` [ingredient]: Καθαρισμένο βόειο λίπος
- `public/blog/what-is-tallow.html:3` — `p` [ingredient,sensory]: Το beef tallow είναι λίπος βοοειδών που έχει διαχωριστεί από τον λιπώδη ιστό και καθαριστεί μέσω κατάλληλης επεξεργασίας. Ανάλογα με τη σύστασή του και τη θερμοκρασία, έχει στερεή ή ημιστερεή υφή.
- `public/blog/what-is-tallow.html:3` — `p` [ingredient]: Αποτελείται κυρίως από τριγλυκερίδια που περιέχουν λιπαρά οξέα, όπως ελαϊκό, παλμιτικό και στεατικό οξύ. Η αναλογία τους μεταβάλλεται ανάλογα με την πρώτη ύλη και την επεξεργασία.
- `public/blog/what-is-tallow.html:3` — `p` [ingredient,sensory]: Σε ένα καλλυντικό μπορεί να χρησιμοποιηθεί ως λιπαρή βάση που συμβάλλει στη δομή και στη μαλακτική αίσθηση. Το αποτέλεσμα εξαρτάται από τη συνολική σύνθεση — όχι μόνο από ένα συστατικό.
- `public/blog/what-is-tallow.html:3` — `p` [ingredient,sensory]: Η φυσική προέλευση δεν εγγυάται ασφάλεια, αποτελεσματικότητα ή καταλληλότητα για κάθε δέρμα. Το tallow δεν έχει ίδια σύσταση με το ανθρώπινο σμήγμα και δεν πρέπει να θεωρείται θεραπεία για δερματικές παθήσεις.
- `public/blog/what-is-tallow.html:3` — `p` [sensory]: Η ποιότητα της πρώτης ύλης, η σταθερότητα και η αξιολόγηση ασφάλειας της τελικής σύνθεσης έχουν σημασία. Το ακατέργαστο λίπος μαγειρικής δεν υποκαθιστά ένα αξιολογημένο καλλυντικό.
- `public/blog/what-is-tallow.html:3` — `p` [ingredient]: Αναπτύσσουμε ένα ανδρικό face balm με βάση το βόειο στέαρ. Η τελική σύνθεση και τα χαρακτηριστικά του θα ανακοινωθούν μετά τους απαραίτητους ελέγχους.

### public/contact.html — 3 matching locations

- `public/contact.html:3` — `meta@content` [ingredient]: Επικοινώνησε με το PRIMAL CORE για το προϊόν, τα συστατικά και συνεργασίες.
- `public/contact.html:3` — `p` [ingredient]: Για το PRIMAL CORE, τα συστατικά του ή μια πρόταση συνεργασίας, επικοινώνησε απευθείας με την ομάδα μας.
- `public/contact.html:3` — `p` [ingredient]: Βρες πληροφορίες για τη χρήση, τα συστατικά και την κυκλοφορία.

### public/en/about.html — 7 matching locations

- `public/en/about.html:4` — `img@alt` [sensory]: Close-up of the balm texture
- `public/en/about.html:5` — `p` [ingredient]: As we researched, we kept coming across tallow — purified beef fat.
- `public/en/about.html:5` — `p` [ingredient]: This raw material became the starting point for PRIMAL CORE: a men's face balm combining traditional ingredients with a modern approach to formulation.
- `public/en/about.html:6` — `img@alt` [ingredient]: Open jar of PRIMAL CORE Beef Tallow & Mastic 50 ml
- `public/en/about.html:6` — `p` [ingredient,sensory]: A water-free face balm based on beef tallow.
- `public/en/about.html:6` — `p` [sensory]: Our aim is emollient care, a pleasant texture and simple everyday application.
- `public/en/about.html:7` — `li` [ingredient]: Every ingredient should serve a specific functional purpose.

### public/en/blog/ancestral-ingredients.html — 51 matching locations

- `public/en/blog/ancestral-ingredients.html:3` — `title` [ingredient]: Beef Tallow: Returning to the Roots of Skincare \| PRIMAL CORE
- `public/en/blog/ancestral-ingredients.html:3` — `meta@content` [ingredient]: Why an ingredient used for centuries is returning to modern men's facial care.
- `public/en/blog/ancestral-ingredients.html:3` — `meta@content` [ingredient]: Beef Tallow: Returning to the Roots of Skincare \| PRIMAL CORE
- `public/en/blog/ancestral-ingredients.html:3` — `h1` [ingredient]: Beef Tallow: Returning to the Roots of Skincare
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Why an ingredient used for centuries is returning to modern men's facial care.
- `public/en/blog/ancestral-ingredients.html:3` — `img@alt` [ingredient]: Open jar of PRIMAL CORE Beef Tallow & Mastic 50 ml with balm and mastic
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Serums. Active ingredients. Specialised creams. Morning and evening routines. Different products for different areas of the face.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [sensory]: Skin needs proper cleansing, adequate hydration, sun protection and products suited to its own needs.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: That is precisely the thinking behind the return of a traditional ingredient: beef tallow.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Before industrial creams, people used various animal fats and plant oils to care for and protect their skin from cold and dryness.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: One of these was tallow: purified cattle fat.
- `public/en/blog/ancestral-ingredients.html:3` — `h2` [ingredient]: 2. Why does beef tallow have a place in modern skincare?
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Beef tallow is not a mysterious ingredient.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: It is a lipid raw material consisting mainly of triglycerides, with a significant presence of three fatty acids:
- `public/en/blog/ancestral-ingredients.html:3` — `li` [ingredient]: Oleic acid: Associated with the emollient properties and feel of lipid ingredients.
- `public/en/blog/ancestral-ingredients.html:3` — `li` [ingredient]: Palmitic acid: Also found in the skin's natural sebum and used in cosmetics.
- `public/en/blog/ancestral-ingredients.html:3` — `li` [ingredient,sensory]: Stearic acid: Contributes to the structure, stability and texture of many cosmetic products.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: This combination makes tallow an interesting raw material for rich, emollient skincare products.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Clean ingredients.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [sensory]: No parabens. No sulfates. No artificial fragrances.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Yet the absence of an ingredient does not itself prove quality.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient,count]: A five-ingredient product is not necessarily safer than a twenty-ingredient one.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: A natural ingredient can also cause unwanted reactions.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Every ingredient should have a specific reason to be there.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: A few carefully selected ingredients.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [sensory]: No added water.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [sensory]: No synthetic fragrance.
- `public/en/blog/ancestral-ingredients.html:3` — `h2` [ingredient]: 4. Beef tallow and the skin's natural lipids
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Between its cells are lipids, mainly ceramides, cholesterol and free fatty acids, which help limit water loss.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Beef tallow contains fatty acids also found in various natural lipids in the human body.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [sensory]: It can help skin feel softer and reduce moisture loss through the protective lipid coating it forms.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Effectiveness lies not only in the main ingredient, but in how you use it.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: It has created products with better stability, advanced ingredient-delivery systems and targeted applications.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [sensory]: A moisturiser that spreads easily.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: This need does not necessarily require dozens of ingredients.
- `public/en/blog/ancestral-ingredients.html:3` — `h3` [sensory]: Why we choose a water-free approach
- `public/en/blog/ancestral-ingredients.html:3` — `p` [sensory]: PRIMAL CORE is being developed as a water-free face balm, with no added water.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: This allows a lipid formula without the conventional process of emulsifying water and oils.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Nature does not create ingredients for human skincare.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Likewise, a synthetic ingredient is not necessarily harmful.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [sensory]: What matters is the right selection, appropriate concentration, stability and safety of the final formula.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Using beef tallow alone is therefore no guarantee of effectiveness.
- `public/en/blog/ancestral-ingredients.html:3` — `h2` [ingredient]: 7. Beef tallow is the base. Not the whole solution.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: There is a tendency to present beef tallow as the only ingredient skin needs.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: Beef tallow can form the base of a cosmetic formula.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient,sensory]: Other ingredients can influence texture, spreadability, oxidative stability and the overall feel of application.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: The aim is not simply to make a balm containing beef tallow.
- `public/en/blog/ancestral-ingredients.html:3` — `h2` [sensory]: 8. Why this philosophy matters today
- `public/en/blog/ancestral-ingredients.html:3` — `h2` [ingredient]: PRIMAL CORE: ANCESTRAL INGREDIENTS. MODERN FORMULATION.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [ingredient]: PRIMAL CORE is a men's face balm under development, with beef tallow as its main ingredient.
- `public/en/blog/ancestral-ingredients.html:3` — `p` [sensory]: It is designed for emollient care, everyday comfort and a pleasant application without an excessively greasy feel.

### public/en/blog/chios-mastic-skincare.html — 55 matching locations

- `public/en/blog/chios-mastic-skincare.html:3` — `title` [ingredient]: Chios Mastic: The Natural Ingredient with 2,500 Years of History Returning to Facial Skincare \| PRIMAL CORE
- `public/en/blog/chios-mastic-skincare.html:3` — `meta@content` [ingredient]: The origins, history and research interest surrounding Chios mastic in facial skincare.
- `public/en/blog/chios-mastic-skincare.html:3` — `meta@content` [ingredient]: Chios Mastic: The Natural Ingredient with 2,500 Years of History Returning to Facial Skincare
- `public/en/blog/chios-mastic-skincare.html:3` — `h1` [ingredient]: Chios Mastic: The Natural Ingredient with 2,500 Years of History Returning to Facial Skincare
- `public/en/blog/chios-mastic-skincare.html:3` — `img@alt` [ingredient]: Golden mastic tears on dark stone
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: A small tear of resin. Thousands of years of history. And a natural ingredient that continues to attract scientific interest.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: In southern Chios, a distinctive tree produces something rarely found elsewhere in the world: Chios mastic.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient,sensory]: A natural resin with a characteristic scent, complex chemistry and a history dating back to antiquity.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Most people know it for its flavour. Fewer know that Chios mastic is also used in cosmetics, while researchers study the properties of its constituents and their potential skincare applications.
- `public/en/blog/chios-mastic-skincare.html:3` — `h2` [ingredient]: What is Chios mastic?
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient,sensory]: Chios mastic is a natural aromatic resin produced by the mastic tree (Pistacia lentiscus var. Chia), traditionally cultivated in southern Chios.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Growers make small incisions in the tree's trunk and branches. Resin seeps out and gradually hardens into the characteristic “tears” of mastic.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Chios mastic has held Protected Designation of Origin (PDO) status since 1997. In 2014, the traditional knowledge of its cultivation was inscribed on UNESCO's Intangible Cultural Heritage list.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: It is more than another plant ingredient. It is closely tied to a particular place, its people and a long tradition.
- `public/en/blog/chios-mastic-skincare.html:3` — `h2` [ingredient]: Chios mastic and skin: what are its properties?
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Interest in Chios mastic for facial care relates mainly to its chemical composition.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient,sensory]: The resin contains various natural compounds, including triterpenes and aromatic constituents, that are the subject of scientific research.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Some mastic constituents and extracts have shown antioxidant activity in laboratory studies.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: However, laboratory antioxidant activity alone does not prove that a mastic product protects human skin from premature ageing.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: One interesting research area concerns the relationship between certain mastic compounds and enzymes involved in breaking down structural skin proteins.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: A scientific study published in 2024 in the journal Cosmetics examined Chios mastic's chemical composition and the activity of its constituents against collagenase and elastase enzymes.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: The results suggest mastic is an interesting subject for research into future cosmetic applications.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: They do not prove that a mastic cream reduces wrinkles, increases collagen or firms the skin.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Chios mastic has also been studied for the antimicrobial activity of certain extracts and constituents.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: However, antimicrobial activity in laboratory conditions does not mean mastic treats acne or cures skin infections.
- `public/en/blog/chios-mastic-skincare.html:3` — `h3` [ingredient]: 4. A natural ingredient for modern cosmetic formulas
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Mastic can be used in different forms, including extracts and derivatives, depending on the purpose of the cosmetic formula.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: The chosen form, concentration, stability and compatibility with other ingredients determine its function in the final product.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [sensory]: Why does this matter?
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Because an ingredient's properties are not automatically proven properties of every product containing it.
- `public/en/blog/chios-mastic-skincare.html:3` — `h2` [ingredient]: Chios mastic for the face: what does science actually say?
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Chios mastic has a significant history of use and an interesting chemical composition.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Through chemical analysis and laboratory biological evaluation, the study by Stamou and colleagues (2024) highlighted the potential of specific mastic constituents for cosmetic applications.
- `public/en/blog/chios-mastic-skincare.html:3` — `h2` [ingredient]: Why does Chios mastic belong in the PRIMAL CORE philosophy?
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Beef tallow: A fatty-acid-rich animal fat that can serve as a base for a rich, emollient cosmetic formula.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Chios mastic: A Greek natural resin with distinctive chemistry, history and research interest for cosmetic applications.
- `public/en/blog/chios-mastic-skincare.html:3` — `h2` [ingredient]: Is Chios mastic suitable for every skin type?
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: As with any plant-derived cosmetic ingredient, mastic is not necessarily suitable for everyone.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Tolerance depends on the ingredient's form, concentration, the overall formula and the skin's individual needs.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: An ingredient's natural origin does not guarantee it cannot cause irritation.
- `public/en/blog/chios-mastic-skincare.html:3` — `h2` [ingredient]: Frequently asked questions about Chios mastic
- `public/en/blog/chios-mastic-skincare.html:3` — `h3` [ingredient]: Is Chios mastic good for the face?
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Mastic contains natural compounds with interesting properties being studied for cosmetic applications. Potential facial benefits depend on the product's final formula and supporting scientific evidence.
- `public/en/blog/chios-mastic-skincare.html:3` — `h3` [ingredient]: Does Chios mastic help with wrinkles?
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Laboratory studies have examined how its constituents affect enzymes associated with collagen and elastin breakdown. These studies do not provide sufficient clinical evidence to claim that mastic reduces wrinkles on the human face.
- `public/en/blog/chios-mastic-skincare.html:3` — `h3` [ingredient]: Is Chios mastic suitable for dry skin?
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient,sensory]: Suitability depends on the overall cosmetic formula. A balm containing mastic may also include emollient lipids that help skin maintain its softness.
- `public/en/blog/chios-mastic-skincare.html:3` — `h3` [ingredient]: Can Chios mastic be used every day?
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: This depends on the specific product, its directions and skin tolerance. Applying raw resin directly to the face without appropriate cosmetic processing is not recommended.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Chios mastic does not need exaggerated promises to be interesting.
- `public/en/blog/chios-mastic-skincare.html:3` — `p` [ingredient]: Its unique origin, traditional harvesting and distinctive chemistry already provide reasons to explore it as an ingredient in modern skincare.
- `public/en/blog/chios-mastic-skincare.html:3` — `li` [ingredient]: Stamou, P. et al. (2024). Revealing the Potential of Chios Mastic Gum and Its Constituents for Cosmetic Applications through Chemical Profiling and Biological Evaluation. Cosmetics, 11(5), 155.
- `public/en/blog/chios-mastic-skincare.html:3` — `li` [ingredient]: UNESCO (2014). Know-how of cultivating mastic on the island of Chios.
- `public/en/blog/chios-mastic-skincare.html:3` — `li` [ingredient]: European Commission. Masticha Chiou — Protected Designation of Origin (PDO).
- `public/en/blog/chios-mastic-skincare.html:3` — `li` [ingredient]: Chios Mastiha Growers Association — Information about mastic's origin, production and cultivation.

### public/en/blog/hippocrates-tallow-mastic.html — 24 matching locations

- `public/en/blog/hippocrates-tallow-mastic.html:3` — `title` [ingredient]: From Hippocrates to PRIMAL CORE: The Forgotten History of Beef Tallow and Chios Mastic in Ancient Greece \| PRIMAL CORE
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `meta@content` [ingredient]: The history of tallow and Chios mastic in ancient Greek skincare and the inspiration behind PRIMAL CORE.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `meta@content` [ingredient]: From Hippocrates to PRIMAL CORE: The Forgotten History of Beef Tallow and Chios Mastic in Ancient Greece
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `h1` [ingredient]: From Hippocrates to PRIMAL CORE: The Forgotten History of Beef Tallow and Chios Mastic in Ancient Greece
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: Before the modern beauty industry filled shelves with synthetic polymers and chemical preservatives, the ancient Greeks had already decoded skin biology. The modern ancestral skincare trend is not a new invention. It is a return to techniques and ingredients scientifically documented 2,500 years ago.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: At the heart of this tradition are two powerful natural materials: purified animal fat (beef tallow, or ancient stear) and Chios mastic resin.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient,sensory]: Stear and pimele. In classical texts, pimele referred to soft fat, while stear meant the hard, purified fat of cattle, sheep and goats. In the Hippocratic Corpus (fifth–fourth century BC), stear is systematically recorded as a key ingredient in emollient poultices and healing ointments for burns, wounds and dry skin.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient,sensory]: Oesypus (ancient lanolin). The pharmacologist Pedanius Dioscorides (first century AD), in his monumental De Materia Medica (Book II, chapter 74), devotes an extensive entry to oesypus: fat extracted from unwashed sheep's wool. Dioscorides and later Galen (second century AD) recommended it for smoothing wrinkles, restoring irritated skin and nourishing the skin.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `h2` [ingredient]: 2. Chios mastic: the “tears” that brought radiance
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient,sensory]: While animal fat provided structure and deep hydration, ancient Greeks sought natural preservatives and active ingredients to protect the skin. The answer lay in southern Chios.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient]: Dioscorides' account. In De Materia Medica (Book I, chapter 70, entries on the mastic tree and mastic), Dioscorides praises Chios resin for its astringent, emollient and cleansing properties, noting that it “brings radiance to the skin”.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient]: The accounts of Herodotus and Theophrastus. As early as the fifth century BC, Herodotus mentions resin collection, while Theophrastus describes the uniqueness of the mastic-bearing tree (Pistacia lentiscus var. chia) in his Enquiry into Plants.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: 1. Melting and purification. As Dioscorides describes, they melted raw tallow over a low flame, strained it through linen and repeatedly “washed” it with clean water or wine. This removed proteins, leaving only pure, odourless lipid.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient,sensory]: 2. Warm infusion. They added ground Chios mastic, beeswax, iris root or rose petals to the purified fat. Mastic contributed not only a beautiful scent but also a strong antimicrobial action that kept the cream unchanged for months.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient]: The secret of Byzantine empresses. Centuries after classical antiquity, the Byzantine imperial physicians Oribasius (fourth century AD) and Aetius of Amida (sixth century AD) continued prescribing ointments based on animal fat and Chios mastic to the empresses of Constantinople to preserve youthfulness.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient]: The first “Galen's cream” (cold cream). Galen created Ceratum Galeni, the first moisturising cream in history, by mixing animal fat or olive oil with beeswax and rosewater — a formula still taught in pharmacy today.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: Science today confirms what Hippocrates and Dioscorides knew empirically. Beef tallow has a lipid profile almost identical to human sebum, rich in fat-soluble vitamins A, D, E and K. The European Medicines Agency (EMA) has also officially recognised Chios mastic as a traditional herbal medicine for skin inflammation and healing minor wounds.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient,count,sensory]: PRIMAL CORE revives this ancient Greek expertise. Without 30 incomprehensible chemical ingredients, artificial fragrances or unnecessary additives, we combine the pure base of beef tallow with authentic Chios mastic.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `li` [ingredient]: After shaving. Instantly soothes minor irritation thanks to mastic resin.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `li` [sensory]: On dry skin. Absorbs without leaving a greasy feel, returning skin to its most resilient state.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: 1. Hippocrates, On Ulcers and Diseases of Women (Hippocratic Corpus, fifth–fourth century BC) — References to tallow in healing and emollient preparations.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: 2. Pedanius Dioscorides, De Materia Medica (first century AD) — Book I, chapter 70 (mastic tree / mastic) and Book II, chapters 74–76 (oesypus and tallow).
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: 3. Galen, On the Composition of Medicines According to Places (second century AD) — Records of emollient ointments based on animal fat and resins.
- `public/en/blog/hippocrates-tallow-mastic.html:3` — `p` [ingredient]: 4. European Medicines Agency (EMA), Community herbal monograph on Pistacia lentiscus L., resin (mastix) (2015) — Official recognition for skin inflammation and wound healing.

### public/en/blog/index.html — 16 matching locations

- `public/en/blog/index.html:3` — `meta@content` [ingredient]: Read about beef tallow, ingredients and simple everyday skincare.
- `public/en/blog/index.html:3` — `img@alt` [ingredient]: Golden mastic tears on dark stone
- `public/en/blog/index.html:3` — `h2` [ingredient]: Chios Mastic: The Natural Ingredient with 2,500 Years of History Returning to Facial Skincare
- `public/en/blog/index.html:3` — `h2` [ingredient]: From Hippocrates to PRIMAL CORE: The Forgotten History of Beef Tallow and Chios Mastic in Ancient Greece
- `public/en/blog/index.html:3` — `img@alt` [ingredient]: What Is Beef Tallow?
- `public/en/blog/index.html:3` — `h2` [ingredient]: What Is Beef Tallow?
- `public/en/blog/index.html:3` — `img@alt` [ingredient]: The Science Behind Beef Tallow: Fatty Acids, Vitamins and Skincare
- `public/en/blog/index.html:3` — `h2` [ingredient]: The Science Behind Beef Tallow: Fatty Acids, Vitamins and Skincare
- `public/en/blog/index.html:3` — `img@alt` [ingredient]: Why Beef Tallow Is Becoming One of 2026's Most Discussed Facial Skincare Trends
- `public/en/blog/index.html:3` — `h2` [ingredient]: Why Beef Tallow Is Becoming One of 2026's Most Discussed Facial Skincare Trends
- `public/en/blog/index.html:3` — `img@alt` [ingredient]: Open jar of PRIMAL CORE Beef Tallow & Mastic 50 ml with balm and mastic
- `public/en/blog/index.html:3` — `h2` [ingredient]: Beef Tallow: Returning to the Roots of Skincare
- `public/en/blog/index.html:3` — `img@alt` [ingredient]: Beef Tallow on Your Face: Is It Safe and How Do You Use It?
- `public/en/blog/index.html:3` — `h2` [ingredient]: Beef Tallow on Your Face: Is It Safe and How Do You Use It?
- `public/en/blog/index.html:3` — `img@alt` [ingredient]: 30 Days with Beef Tallow: What Might Change on Your Face?
- `public/en/blog/index.html:3` — `h2` [ingredient]: 30 Days with Beef Tallow: What Might Change on Your Face?

### public/en/blog/tallow-safety.html — 58 matching locations

- `public/en/blog/tallow-safety.html:3` — `title` [ingredient]: Beef Tallow on Your Face: Is It Safe and How Do You Use It? \| PRIMAL CORE
- `public/en/blog/tallow-safety.html:3` — `meta@content` [ingredient]: Can you use beef tallow on your face every day? What does it offer your skin, and what should you know before trying it?
- `public/en/blog/tallow-safety.html:3` — `meta@content` [ingredient]: Beef Tallow on Your Face: Is It Safe and How Do You Use It? \| PRIMAL CORE
- `public/en/blog/tallow-safety.html:3` — `h1` [ingredient]: Beef Tallow on Your Face: Is It Safe and How Do You Use It?
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: Can you use beef tallow on your face every day? What does it offer your skin, and what should you know before trying it?
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: Beef tallow is making a strong return to skincare.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: A traditional raw material is becoming an ingredient in modern skincare products.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: “Can I really put animal fat on my face?”
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: The short answer is yes. Properly processed beef tallow can be used as an ingredient in facial cosmetics.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: Of course, this does not mean that raw animal fat is suitable for the skin, or that every tallow product suits everyone.
- `public/en/blog/tallow-safety.html:3` — `p` [sensory]: Quality, formulation and skin type matter.
- `public/en/blog/tallow-safety.html:3` — `h2` [ingredient]: 1. What is beef tallow, and why is it used on the face?
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: Beef tallow is purified cattle fat obtained through appropriate processing.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: It consists mainly of triglycerides containing fatty acids such as:
- `public/en/blog/tallow-safety.html:3` — `li` [ingredient]: Oleic acid: Contributes to the emollient properties of lipid-based formulations.
- `public/en/blog/tallow-safety.html:3` — `li` [ingredient]: Palmitic acid: Also occurs in the skin's natural sebum.
- `public/en/blog/tallow-safety.html:3` — `li` [ingredient,sensory]: Stearic acid: Contributes to a balm's structure and characteristic texture.
- `public/en/blog/tallow-safety.html:3` — `p` [sensory]: These lipids can help skin feel softer and reduce moisture loss from its surface.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: This is one reason beef tallow is interesting as a skincare base.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: You do not need to believe it is a miracle ingredient.
- `public/en/blog/tallow-safety.html:3` — `h2` [ingredient]: 2. Is beef tallow safe for the face?
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: Beef tallow can be used in facial cosmetics when the raw material is of appropriate quality and the final formula has been assessed as safe for its intended use.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: This is different from putting just any animal fat directly on your face.
- `public/en/blog/tallow-safety.html:3` — `p` [sensory]: What matters:
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: A rich balm may feel pleasant to someone with dry skin, yet too heavy for someone with very oily skin.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: The right question is not whether beef tallow suits everyone. It is whether the particular formula suits your skin's needs.
- `public/en/blog/tallow-safety.html:3` — `h2` [ingredient]: 3. What needs can a tallow face balm help with?
- `public/en/blog/tallow-safety.html:3` — `h3` [sensory]: Rough texture
- `public/en/blog/tallow-safety.html:3` — `p` [sensory]: An emollient balm can help skin feel softer and smoother.
- `public/en/blog/tallow-safety.html:3` — `h3` [sensory]: Fine dehydration lines
- `public/en/blog/tallow-safety.html:3` — `p` [sensory]: Appropriate hydration and emollient care can temporarily improve their appearance.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: This does not mean tallow removes wrinkles or reverses ageing.
- `public/en/blog/tallow-safety.html:3` — `h2` [ingredient]: 4. Is it suitable for oily or acne-prone skin?
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: Beef tallow is a rich, fatty raw material.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: Some people may tolerate a tallow formula well, while others may find it too heavy.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: If you have oily skin, clogged pores or active acne, take particular care when choosing a product.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: A natural ingredient is not automatically suitable for every skin type.
- `public/en/blog/tallow-safety.html:3` — `h2` [ingredient]: 5. How do you use a tallow face balm?
- `public/en/blog/tallow-safety.html:3` — `p` [sensory]: Applying to slightly damp skin may help retain existing moisture, as a water-free balm does not itself add water to the skin.
- `public/en/blog/tallow-safety.html:3` — `h2` [ingredient]: 6. Can you use beef tallow on the body too?
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: Yes, beef tallow is also used in body-care products.
- `public/en/blog/tallow-safety.html:3` — `h2` [sensory]: 7. Will it leave my face greasy?
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: Beef tallow naturally has a rich, fatty composition.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: However, a balm's final feel also depends on its other ingredients, their proportions and the manufacturing process.
- `public/en/blog/tallow-safety.html:3` — `p` [sensory]: A carefully designed formula can aim for easier spreading and a lighter feel.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: This is not guaranteed simply because a product contains tallow.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: One of our main development goals is a balm without the excessively heavy feel of some traditional oil-rich products.
- `public/en/blog/tallow-safety.html:3` — `p` [sensory]: We want a formula that spreads easily, offers emollient care and fits into daily life without unnecessary effort.
- `public/en/blog/tallow-safety.html:3` — `h2` [ingredient]: 8. Why we chose beef tallow for PRIMAL CORE
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: We did not choose beef tallow because we believe it is better than every modern cosmetic ingredient.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: Few ingredients. Every raw material should serve a specific purpose.
- `public/en/blog/tallow-safety.html:3` — `p` [sensory]: No added water. A water-free formula focused on emollient care.
- `public/en/blog/tallow-safety.html:3` — `p` [sensory]: No synthetic fragrance. For a more subtle experience.
- `public/en/blog/tallow-safety.html:3` — `p` [sensory]: An emphasis on texture. Because a product that is unpleasant to apply is unlikely to become a daily habit.
- `public/en/blog/tallow-safety.html:3` — `h2` [ingredient]: The conclusion: can you use beef tallow on your face?
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: Beef tallow contains lipids with emollient properties and can form the base of an everyday skincare product.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: We are developing a men's face balm based on beef tallow.
- `public/en/blog/tallow-safety.html:3` — `p` [ingredient]: With a few selected ingredients and the aim of simple, everyday emollient care for the face.

### public/en/blog/tallow-science.html — 81 matching locations

- `public/en/blog/tallow-science.html:3` — `title` [ingredient]: The Science Behind Beef Tallow: Fatty Acids, Vitamins and Skincare \| PRIMAL CORE
- `public/en/blog/tallow-science.html:3` — `meta@content` [ingredient]: What does beef tallow actually contain, how do its constituents work, and why is it returning to modern facial skincare?
- `public/en/blog/tallow-science.html:3` — `meta@content` [ingredient]: The Science Behind Beef Tallow: Fatty Acids, Vitamins and Skincare \| PRIMAL CORE
- `public/en/blog/tallow-science.html:3` — `h1` [ingredient]: The Science Behind Beef Tallow: Fatty Acids, Vitamins and Skincare
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: What does beef tallow actually contain, how do its constituents work, and why is it returning to modern facial skincare?
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: There is a reason beef tallow has been used in skincare for generations.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Beef tallow, or purified cattle fat, contains a distinctive combination of fatty acids also used in modern cosmetics.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Oleic acid. Stearic acid. Palmitic acid.
- `public/en/blog/tallow-science.html:3` — `h2` [ingredient]: 1. The secret lies in the fatty acids
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Beef tallow consists mainly of triglycerides, molecules that include fatty acids.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: It typically contains approximately 46–55% saturated fatty acids, with a significant proportion of monounsaturated fats.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Three of its main fatty acids are:
- `public/en/blog/tallow-science.html:3` — `h3` [ingredient]: Oleic acid
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Oleic acid is a monounsaturated fatty acid also found in olive oil and other natural oils.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient,sensory]: In cosmetics, ingredients containing it can contribute to a soft, supple skin feel.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Free oleic acid can also affect the permeability of the skin's outer layer. This does not mean every oleic-acid-containing product is automatically absorbed better or suits every skin type.
- `public/en/blog/tallow-science.html:3` — `h3` [ingredient]: Palmitic acid
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: A fatty acid also found in the skin's natural sebum.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Palmitic acid is one of beef tallow's significant fatty acids.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: It also occurs in human sebum, the natural oily secretion that helps protect and lubricate the skin surface.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: However, its presence does not mean beef tallow has exactly the same composition as human sebum.
- `public/en/blog/tallow-science.html:3` — `h3` [ingredient]: Stearic acid
- `public/en/blog/tallow-science.html:3` — `p` [sensory]: Structure, stability and rich texture.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Stearic acid is a saturated fatty acid of particular importance in cosmetic formulation.
- `public/en/blog/tallow-science.html:3` — `p` [sensory]: It helps shape texture and can provide a richer, more stable feel in a cream or balm.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Its presence in beef tallow is one reason the material has its characteristic semisolid to solid consistency at room temperature.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Beef tallow offers an interesting lipid base for products aimed at emollient care and reducing the feeling of dryness.
- `public/en/blog/tallow-science.html:3` — `h2` [ingredient]: 2. Vitamins A, D, E and K: what does tallow actually contain?
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: One of the most common arguments for beef tallow is that it contains fat-soluble vitamins.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Depending on the raw material and its processing, small or variable amounts of vitamins may indeed be present.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: But there is a big difference between an ingredient containing a vitamin and delivering clinically proven results when applied to the skin.
- `public/en/blog/tallow-science.html:3` — `h3` [ingredient]: Vitamin A
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Vitamin A and its derivatives play an important role in skin biology.
- `public/en/blog/tallow-science.html:3` — `p` [sensory]: Certain retinoids are used in cosmetics and dermatology to improve the appearance of fine lines and skin texture.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: However, naturally occurring small amounts of vitamin A in beef tallow do not make it equivalent to a retinol product.
- `public/en/blog/tallow-science.html:3` — `h3` [ingredient]: Vitamin D
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Vitamin D is involved in important biological skin processes, including cell differentiation and immune function.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: This does not prove that applying beef tallow delivers enough vitamin D to produce corresponding effects.
- `public/en/blog/tallow-science.html:3` — `h3` [ingredient]: Vitamin E
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Vitamin E is known for its antioxidant action.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: In cosmetics, it is used both to protect fatty ingredients from oxidation and in skincare formulations.
- `public/en/blog/tallow-science.html:3` — `p` [sensory]: Its concentration and chemical form matter to its final action.
- `public/en/blog/tallow-science.html:3` — `h3` [ingredient]: Vitamin K
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Vitamin K naturally participates in processes such as blood clotting.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: However, the small amount of vitamin K that may be present in beef tallow has not been proven to reduce dark circles or visible capillaries.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Vitamins have known biological roles. This does not mean beef tallow delivers them to skin in amounts that ensure the same effects.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: To understand the role of fatty ingredients in skincare, we first need to understand how skin works.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Between its cells are lipids, chiefly ceramides, cholesterol and free fatty acids.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Appropriate emollient and protective ingredients can help skin retain moisture better.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Because of its fatty nature, beef tallow can be used as an ingredient in such a formula.
- `public/en/blog/tallow-science.html:3` — `h2` [ingredient]: 4. Grass-fed beef tallow: is it really different?
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Fat from pasture-raised cattle may, for example, have different concentrations of certain fatty acids, such as conjugated linoleic acid, known as CLA.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: This does not allow us to conclude that a grass-fed beef tallow cream treats eczema, rosacea or other skin conditions.
- `public/en/blog/tallow-science.html:3` — `p` [sensory]: At PRIMAL CORE, raw material selection is a matter of quality, not an opportunity for unsupported claims.
- `public/en/blog/tallow-science.html:3` — `h2` [ingredient]: 5. Beef tallow or plant oils? It is not that simple.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Beef tallow is often presented as superior to all plant oils.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Every oil has its own lipid profile and behaves differently within a cosmetic formula.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Beef tallow: Contains significant amounts of oleic, palmitic and stearic acids. Used as a rich lipid base with emollient properties.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient,sensory]: Jojoba: Consists mainly of liquid waxes, with a distinctive feel during application. Often used to improve texture and spreadability.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Argan oil: Contains mainly oleic and linoleic acids, along with other constituents that make it popular in skincare.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Coconut oil: High in lauric acid, with strong emollient properties, although it does not suit every skin type.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: The aim is not to declare one ingredient the winner.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: It is to understand how different ingredients can work together to create a better overall formula.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: We do not believe beef tallow needs to exclude every other ingredient.
- `public/en/blog/tallow-science.html:3` — `h2` [ingredient,sensory]: 6. Absorption: why the right formula matters more than one ingredient
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: A common argument is that beef tallow absorbs instantly because it resembles human sebum.
- `public/en/blog/tallow-science.html:3` — `li` [ingredient]: The concentrations and proportions of lipid ingredients.
- `public/en/blog/tallow-science.html:3` — `li` [sensory]: The formula's texture and melting temperature.
- `public/en/blog/tallow-science.html:3` — `p` [sensory]: Take time to spread evenly.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Our goal is a face balm with pleasant application, emollient care and the most subtle oily feel possible.
- `public/en/blog/tallow-science.html:3` — `li` [ingredient]: Beef tallow contains fatty acids used in cosmetics.
- `public/en/blog/tallow-science.html:3` — `li` [ingredient]: Beef tallow is superior to all conventional moisturisers.
- `public/en/blog/tallow-science.html:3` — `li` [ingredient]: Its naturally occurring vitamins are absorbed in clinically effective quantities.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Nor because we consider every synthetic ingredient bad.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: Can we create a simple, modern skincare product using beef tallow as its primary raw material?
- `public/en/blog/tallow-science.html:3` — `p` [sensory]: Who wants his face to look smoother and well cared for.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: A selected formula with few ingredients.
- `public/en/blog/tallow-science.html:3` — `p` [sensory]: No added water.
- `public/en/blog/tallow-science.html:3` — `p` [sensory]: No synthetic fragrance.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: You do not need to know what oleic or stearic acid is to care for your face.
- `public/en/blog/tallow-science.html:3` — `p` [ingredient]: PRIMAL CORE — ANCESTRAL INGREDIENTS. MODERN FORMULATION.

### public/en/blog/tallow-skincare.html — 47 matching locations

- `public/en/blog/tallow-skincare.html:3` — `title` [ingredient]: Why Beef Tallow Is Becoming One of 2026's Most Discussed Facial Skincare Trends \| PRIMAL CORE
- `public/en/blog/tallow-skincare.html:3` — `meta@content` [ingredient,sensory]: A return to simpler formulas, the desire for fewer products and the search for meaningful hydration bring a traditional ingredient back into focus.
- `public/en/blog/tallow-skincare.html:3` — `meta@content` [ingredient]: Why Beef Tallow Is Becoming One of 2026's Most Discussed Facial Skincare Trends \| PRIMAL CORE
- `public/en/blog/tallow-skincare.html:3` — `h1` [ingredient]: Why Beef Tallow Is Becoming One of 2026's Most Discussed Facial Skincare Trends
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient,sensory]: A return to simpler formulas, the desire for fewer products and the search for meaningful hydration bring a traditional ingredient back into focus.
- `public/en/blog/tallow-skincare.html:3` — `img@alt` [ingredient]: Beef tallow and facial skincare
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: Serums, creams, active ingredients, morning and evening routines. Dozens of products promising to solve problems we often did not even know we had.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: In 2026, the conversation around skincare is increasingly turning towards simplicity, ingredient transparency and protection of the natural skin barrier.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: Within that conversation, an ingredient with centuries of history is making a strong return: beef tallow, the purified cattle fat used in skincare products.
- `public/en/blog/tallow-skincare.html:3` — `li` [sensory]: Dryness and rough texture
- `public/en/blog/tallow-skincare.html:3` — `li` [sensory]: More visible fine lines due to dehydration
- `public/en/blog/tallow-skincare.html:3` — `h3` [ingredient]: Where does beef tallow fit in?
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: Beef tallow consists mainly of fatty acids such as oleic, palmitic and stearic acids.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: In a well-designed formula, tallow can help create a protective, emollient layer on the skin surface, reducing the feeling of dryness.
- `public/en/blog/tallow-skincare.html:3` — `h2` [sensory]: 2. Why texture matters so much
- `public/en/blog/tallow-skincare.html:3` — `p` [sensory]: Today's man does not want to walk around with a greasy layer on his face.
- `public/en/blog/tallow-skincare.html:3` — `li` [sensory]: Spreads easily.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: The preparation technique, proportions of lipid ingredients and overall formula determine the final experience.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient,sensory]: Whipped tallow, for example, gains an airier texture through mechanical mixing. This can make it easier to apply without necessarily meaning faster absorption.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: At PRIMAL CORE, the goal is not simply to use beef tallow.
- `public/en/blog/tallow-skincare.html:3` — `p` [sensory]: It is to develop a traditional raw material into a modern men's skincare product, with particular attention to texture and everyday ease.
- `public/en/blog/tallow-skincare.html:3` — `p` [sensory]: A less greasy feel. More practicality. No unnecessary complexity.
- `public/en/blog/tallow-skincare.html:3` — `h2` [ingredient,sensory]: 3. Grass-fed beef tallow: why origin matters
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: Ingredient origin is becoming increasingly important to consumers.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: This is one reason grass-fed beef tallow, fat from cattle fed on grass, attracts interest.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: Beef tallow may contain fat-soluble vitamins and various fatty acids. Actual concentrations depend on the raw material and its processing.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: Grass-fed origin alone does not guarantee greater effectiveness on the skin.
- `public/en/blog/tallow-skincare.html:3` — `p` [sensory]: What really matters for a quality cosmetic is controlled sourcing, raw material purity, stability and safety of the final formula.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: Face oil.
- `public/en/blog/tallow-skincare.html:3` — `p` [sensory]: Natural? Organic? Preservative-free? Fragrance-free?
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: A natural ingredient is not automatically safer than a synthetic one. Likewise, a product with many ingredients is not necessarily worse than one with few.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient,sensory]: What matters is each ingredient's suitability and concentration, and the safety of the overall formula.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: A simple formula. A limited number of ingredients, each with a specific functional purpose.
- `public/en/blog/tallow-skincare.html:3` — `p` [sensory]: No added water. A water-free formula designed for emollient care.
- `public/en/blog/tallow-skincare.html:3` — `p` [sensory]: No synthetic fragrance. Aiming for a more subtle application experience.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: The final ingredient selection will be determined once development and testing are complete.
- `public/en/blog/tallow-skincare.html:3` — `h2` [ingredient]: 6. Beef tallow and fine lines: what can we really expect?
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: No ingredient can remove wrinkles simply because it is natural or has been used for centuries.
- `public/en/blog/tallow-skincare.html:3` — `p` [sensory]: Appropriate hydration and emollient care can temporarily improve the appearance of fine dehydration lines, making the skin surface look smoother and softer.
- `public/en/blog/tallow-skincare.html:3` — `p` [sensory]: Skin that looks better cared for, with less dryness and a smoother appearance.
- `public/en/blog/tallow-skincare.html:3` — `h2` [ingredient]: 7. Why is interest in beef tallow growing?
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: Beef tallow's return to skincare is not a coincidence.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: A return to recognisable ingredients. Consumers are more interested in their products' contents and origins.
- `public/en/blog/tallow-skincare.html:3` — `p` [sensory]: An emphasis on hydration. Interest is shifting from excessive promises towards everyday skin health and comfort.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: That is why we are developing a men's face balm based on beef tallow, aiming to offer emollient care, comfort and a pleasant everyday feel.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: Beef tallow's return does not mean we have discovered a miraculous secret.
- `public/en/blog/tallow-skincare.html:3` — `p` [ingredient]: We are developing a new men's face balm based on beef tallow.

### public/en/blog/thirty-days.html — 29 matching locations

- `public/en/blog/thirty-days.html:3` — `title` [ingredient]: 30 Days with Beef Tallow: What Might Change on Your Face? \| PRIMAL CORE
- `public/en/blog/thirty-days.html:3` — `meta@content` [ingredient]: 30 Days with Beef Tallow: What Might Change on Your Face? \| PRIMAL CORE
- `public/en/blog/thirty-days.html:3` — `h1` [ingredient]: 30 Days with Beef Tallow: What Might Change on Your Face?
- `public/en/blog/thirty-days.html:3` — `img@alt` [ingredient]: 30 Days with Beef Tallow: What Might Change on Your Face?
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: Beef tallow has attracted interest as a skincare ingredient thanks to its lipid composition and the emollient properties it can offer in a properly designed balm.
- `public/en/blog/thirty-days.html:3` — `p` [sensory]: How it spreads on your skin.
- `public/en/blog/thirty-days.html:3` — `p` [sensory]: Whether it leaves a greasy feel, or its texture suits your preferences.
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: Beef tallow consists mainly of lipids, including oleic, palmitic and stearic acids.
- `public/en/blog/thirty-days.html:3` — `p` [sensory]: A balm may therefore leave skin feeling softer from the first application and reduce tightness associated with dryness.
- `public/en/blog/thirty-days.html:3` — `p` [sensory]: What you might notice: A softer feeling on your skin, especially if you experience dryness.
- `public/en/blog/thirty-days.html:3` — `h2` [sensory]: Days 8–14: The importance of consistent hydration
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: This does not mean beef tallow repairs deep skin damage or replaces dermatological treatments.
- `public/en/blog/thirty-days.html:3` — `p` [sensory]: When skin retains moisture better, its surface may look smoother.
- `public/en/blog/thirty-days.html:3` — `p` [sensory]: This may temporarily make some fine dehydration lines less noticeable.
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: Nor does it mean beef tallow has proven effects comparable to specialised anti-ageing active ingredients.
- `public/en/blog/thirty-days.html:3` — `p` [sensory]: What you might notice: A smoother appearance of dry skin.
- `public/en/blog/thirty-days.html:3` — `p` [sensory]: This matters especially to men who do not want to spend much time on facial care.
- `public/en/blog/thirty-days.html:3` — `p` [sensory]: What you can assess after 30 days: Skin comfort, dryness, texture and how easily the product fits into daily life.
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: There is no guarantee that tallow will produce specific changes within 30 days.
- `public/en/blog/thirty-days.html:3` — `h2` [ingredient]: What you should not expect from a tallow balm
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: A beef tallow cosmetic has not been proven to:
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: Beef tallow is a raw material with interesting emollient properties.
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: That is why we are developing a men's face balm based on beef tallow.
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: With a limited number of selected ingredients:
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: Beef Tallow. Jojoba Oil. Beeswax. Chios Mastic Oil. Vitamin E.
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: Each ingredient serves a different functional role in the formula.
- `public/en/blog/thirty-days.html:3` — `p` [sensory]: Our goal is a balm that spreads easily, offers emollient care and feels as pleasant as possible in everyday use.
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: Not because beef tallow holds a secret to eternal youth.
- `public/en/blog/thirty-days.html:3` — `p` [ingredient]: PRIMAL CORE — ANCESTRAL INGREDIENTS. MODERN FORMULATION.

### public/en/blog/what-is-tallow.html — 10 matching locations

- `public/en/blog/what-is-tallow.html:3` — `title` [ingredient]: What Is Beef Tallow? \| PRIMAL CORE
- `public/en/blog/what-is-tallow.html:3` — `meta@content` [ingredient]: What Is Beef Tallow? \| PRIMAL CORE
- `public/en/blog/what-is-tallow.html:3` — `h1` [ingredient]: What Is Beef Tallow?
- `public/en/blog/what-is-tallow.html:3` — `img@alt` [ingredient]: Purified beef tallow
- `public/en/blog/what-is-tallow.html:3` — `p` [ingredient,sensory]: Beef tallow is cattle fat that has been separated from fatty tissue and purified through appropriate processing. Depending on composition and temperature, it has a solid or semisolid texture.
- `public/en/blog/what-is-tallow.html:3` — `p` [ingredient]: It consists mainly of triglycerides containing fatty acids such as oleic, palmitic and stearic acids. Their proportions vary with the raw material and processing.
- `public/en/blog/what-is-tallow.html:3` — `p` [ingredient]: In a cosmetic, it can serve as a lipid base that contributes structure and an emollient feel. The result depends on the entire formula, not just one ingredient.
- `public/en/blog/what-is-tallow.html:3` — `p` [ingredient]: Natural origin does not guarantee safety, effectiveness or suitability for every skin type. Tallow does not have the same composition as human sebum and should not be regarded as a treatment for skin conditions.
- `public/en/blog/what-is-tallow.html:3` — `p` [sensory]: Raw material quality, stability and safety assessment of the final formula matter. Raw cooking fat is not a substitute for an assessed cosmetic.
- `public/en/blog/what-is-tallow.html:3` — `p` [ingredient]: We are developing a men's face balm based on beef tallow. Its final formula and features will be announced after the necessary checks.

### public/en/contact.html — 3 matching locations

- `public/en/contact.html:3` — `meta@content` [ingredient]: Contact PRIMAL CORE about the product, its ingredients and collaborations.
- `public/en/contact.html:3` — `p` [ingredient]: For questions about PRIMAL CORE, its ingredients or a collaboration, contact our team directly.
- `public/en/contact.html:3` — `p` [ingredient]: Find information about use, ingredients and launch availability.

### public/en/index.html — 35 matching locations

- `public/en/index.html:3` — `meta@content` [ingredient]: A men's face balm under development, based on beef tallow. Discover the philosophy and ingredients of PRIMAL CORE.
- `public/en/index.html:3` — `h1` [sensory]: Want your face to feelsoft and hydrated?
- `public/en/index.html:3` — `summary` [sensory]: Less visible dehydration lines
- `public/en/index.html:3` — `summary` [sensory]: Intensive hydration
- `public/en/index.html:3` — `summary` [sensory]: A smooth, rested appearance
- `public/en/index.html:3` — `p` [sensory]: Leaves the skin surface soft and smooth, with a matte, non-greasy finish.
- `public/en/index.html:3` — `h2` [ingredient,count]: Just 5 ingredients.Nothing else
- `public/en/index.html:3` — `video@aria-label` [ingredient,count]: Presentation of the five ingredients, without speech
- `public/en/index.html:3` — `video@data-video-name` [ingredient]: ingredients
- `public/en/index.html:3` — `button@aria-label` [ingredient]: Pause ingredient video
- `public/en/index.html:3` — `div@aria-label` [ingredient]: PRIMAL CORE ingredients
- `public/en/index.html:3` — `article@aria-label` [count]: 1 of 5
- `public/en/index.html:3` — `h3` [ingredient]: Beef tallow
- `public/en/index.html:3` — `p` [ingredient,sensory]: Beef tallow intensively nourishes and repairs the skin barrier, providing deep hydration through fatty acids and vitamins that resemble the skin's natural lipids.
- `public/en/index.html:3` — `article@aria-label` [count]: 2 of 5
- `public/en/index.html:3` — `h3` [ingredient]: Chios mastic oil
- `public/en/index.html:3` — `p` [ingredient]: Chios mastic oil offers strong antioxidant and antibacterial protection, soothes redness and helps regenerate and firm the skin, giving it a healthy appearance and natural radiance.
- `public/en/index.html:3` — `article@aria-label` [count]: 3 of 5
- `public/en/index.html:3` — `h3` [ingredient]: Beeswax
- `public/en/index.html:3` — `p` [ingredient,sensory]: Beeswax creates a protective film on the skin that locks in moisture and soothes irritation, leaving the face soft and hydrated.
- `public/en/index.html:3` — `article@aria-label` [count]: 4 of 5
- `public/en/index.html:3` — `h3` [ingredient]: Jojoba oil
- `public/en/index.html:3` — `p` [ingredient]: Jojoba oil deeply moisturises and regulates oiliness by mimicking natural sebum without clogging pores.
- `public/en/index.html:3` — `article@aria-label` [count]: 5 of 5
- `public/en/index.html:3` — `h3` [ingredient]: Vitamin E
- `public/en/index.html:3` — `p` [ingredient,sensory]: Vitamin E (Tocopherol) protects the skin from free radicals and premature ageing, strengthening the skin barrier and locking in moisture for soft, supple skin.
- `public/en/index.html:3` — `button@aria-label` [ingredient]: Previous ingredient
- `public/en/index.html:3` — `p` [count]: 1 / 5
- `public/en/index.html:3` — `button@aria-label` [ingredient]: Next ingredient
- `public/en/index.html:3` — `img@alt` [ingredient]: Open jar of PRIMAL CORE Beef Tallow & Mastic 50 ml with balm and mastic
- `public/en/index.html:3` — `p` [ingredient]: Yes, it was made for dry or stressed skin, helping reduce the appearance of dryness and fine lines. For combination skin, use it only on dry areas or in smaller amounts to avoid weighing down oily zones.
- `public/en/index.html:3` — `p` [sensory]: Several weeks when using a small amount daily. The exact duration depends on how much you apply and whether you use it once or twice a day — a little goes a long way, as the balm spreads easily when warmed between your palms.
- `public/en/index.html:3` — `h3` [sensory]: Does it have a scent?
- `public/en/index.html:3` — `summary` [sensory]: Does it have a scent?
- `public/en/index.html:3` — `p` [ingredient,sensory]: Chios mastic provides the signature scent — clean, fresh, resinous and slightly woody.

### public/en/philosophy.html — 6 matching locations

- `public/en/philosophy.html:6` — `p` [ingredient]: As early as the fifth century BC, Hippocrates used purified animal fat (tallow) as a base for healing ointments.
- `public/en/philosophy.html:6` — `p` [ingredient]: Centuries later, Dioscorides, in his work De Materia Medica, recorded the effects of Chios mastic on skin regeneration.
- `public/en/philosophy.html:10` — `p` [ingredient,sensory]: Most creams today are full of synthetic ingredients and artificial fragrances you can barely pronounce.
- `public/en/philosophy.html:11` — `h2` [ingredient,count]: You do not need 30 ingredients.
- `public/en/philosophy.html:15` — `img@alt` [sensory]: Close-up of the balm texture inside a black jar
- `public/en/philosophy.html:15` — `p` [sensory]: Sometimes it means returning to what truly matters.

### public/index.html — 33 matching locations

- `public/index.html:3` — `meta@content` [ingredient]: Ένα ανδρικό face balm υπό ανάπτυξη, με βάση το βόειο στέαρ. Γνώρισε τη φιλοσοφία και τα συστατικά του PRIMAL CORE.
- `public/index.html:3` — `h1` [sensory]: Θέλεις να δεις το πρόσωπό σουαπαλό και ενυδατωμένο;
- `public/index.html:3` — `summary` [sensory]: Λεία & ξεκούραστη όψη
- `public/index.html:3` — `p` [sensory]: Αφήνει την επιφάνεια του δέρματος απαλή και λεία, με ματ, μη λιπαρό τελείωμα.
- `public/index.html:3` — `h2` [ingredient,count]: 5 συστατικά μόνο.Τίποτε άλλο
- `public/index.html:3` — `video@aria-label` [ingredient,count]: Παρουσίαση των πέντε συστατικών, χωρίς ομιλία
- `public/index.html:3` — `video@data-video-name` [ingredient]: συστατικών
- `public/index.html:3` — `button@aria-label` [ingredient]: Παύση βίντεο συστατικών
- `public/index.html:3` — `div@aria-label` [ingredient]: Συστατικά PRIMAL CORE
- `public/index.html:3` — `article@aria-label` [count]: 1 από 5
- `public/index.html:3` — `h3` [ingredient]: Βόειο στέαρ
- `public/index.html:3` — `p` [ingredient]: Το βόειο λίπος (beef tallow) θρέφει εντατικά και επανορθώνει τον δερματικό φραγμό, προσφέροντας βαθιά ενυδάτωση χάρη στα λιπαρά οξέα και τις βιταμίνες που μοιάζουν με τα φυσικά λιπίδια της επιδερμίδας.
- `public/index.html:3` — `article@aria-label` [count]: 2 από 5
- `public/index.html:3` — `h3` [ingredient]: Έλαιο μαστίχας Χίου
- `public/index.html:3` — `p` [ingredient]: Το έλαιο μαστίχας Χίου (Chios mastic oil) προσφέρει ισχυρή αντιοξειδωτική και αντιβακτηριακή προστασία, καταπραΰνει τις κοκκινίλες και βοηθά στην ανάπλαση και τη σύσφιξη της επιδερμίδας, χαρίζοντας υγιή όψη και φυσική λάμψη.
- `public/index.html:3` — `article@aria-label` [count]: 3 από 5
- `public/index.html:3` — `h3` [ingredient]: Μελισσοκέρι
- `public/index.html:3` — `p` [ingredient,sensory]: Το μελισσοκέρι (Beeswax) δημιουργεί ένα προστατευτικό φιλμ στην επιδερμίδα που κλειδώνει την υγρασία και καταπραΰνει τους ερεθισμούς, αφήνοντας το πρόσωπο απαλό και ενυδατωμένο.
- `public/index.html:3` — `article@aria-label` [count]: 4 από 5
- `public/index.html:3` — `h3` [ingredient]: Έλαιο τζοτζόμπα
- `public/index.html:3` — `p` [ingredient,sensory]: Το έλαιο τζοτζόμπα (Jojoba oil) ενυδατώνει σε βάθος και ρυθμίζει τη λιπαρότητα της επιδερμίδας, μιμούμενο το φυσικό σμήγμα χωρίς να φράζει τους πόρους.
- `public/index.html:3` — `article@aria-label` [count]: 5 από 5
- `public/index.html:3` — `h3` [ingredient]: Βιταμίνη Ε
- `public/index.html:3` — `p` [ingredient,sensory]: Η βιταμίνη Ε (Tocopherol) προστατεύει την επιδερμίδα από τις ελεύθερες ρίζες και την πρόωρη γήρανση, ενισχύοντας τον δερματικό φραγμό και κλειδώνοντας την υγρασία για απαλό και ελαστικό δέρμα.
- `public/index.html:3` — `button@aria-label` [ingredient]: Προηγούμενο συστατικό
- `public/index.html:3` — `p` [count]: 1 / 5
- `public/index.html:3` — `button@aria-label` [ingredient]: Επόμενο συστατικό
- `public/index.html:3` — `img@alt` [ingredient]: Ανοιχτό δοχείο PRIMAL CORE Beef Tallow & Mastic 50 ml με βάλσαμο και μαστίχα
- `public/index.html:3` — `p` [sensory]: Ζεσταίνεις μικρή ποσότητα στις παλάμες και απλώνεις σε καθαρό πρόσωπο, πρωί ή βράδυ. Αν το δέρμα σου είναι πολύ ξηρό, ξεκίνα με μία πολύ μικρή ποσότητα το βράδυ και δες πώς ανταποκρίνεται το πρωί. Για εξωτερική χρήση μόνο — απέφυγε την περιοχή των ματιών και σταμάτα τη χρήση αν δεις ερεθισμό.
- `public/index.html:3` — `p` [sensory]: Με καθημερινή χρήση μικρής ποσότητας, αρκετές εβδομάδες. Η ακριβής διάρκεια εξαρτάται από το πόσο απλώνεις κάθε φορά και αν το χρησιμοποιείς μία ή δύο φορές τη μέρα — λίγη ποσότητα αρκεί, γιατί το βάλσαμο απλώνεται εύκολα όταν ζεσταθεί στις παλάμες.
- `public/index.html:3` — `h3` [sensory]: Έχει άρωμα;
- `public/index.html:3` — `summary` [sensory]: Έχει άρωμα;
- `public/index.html:3` — `p` [ingredient,sensory]: Η Μαστίχα Χίου δίνει την κύρια αρωματική υπογραφή — μια καθαρή, δροσερή, ρητινώδη και ελαφρώς ξυλώδη μυρωδιά.

### public/philosophy.html — 5 matching locations

- `public/philosophy.html:6` — `p` [ingredient]: Από τον 5ο αιώνα π.Χ., ο Ιπποκράτης χρησιμοποιούσε το καθαρό ζωικό λίπος (στέαρ) ως βάση για επουλωτικές αλοιφές.
- `public/philosophy.html:6` — `p` [ingredient]: Αιώνες αργότερα, ο Διοσκουρίδης στο έργο του Περί ύλης ιατρικής κατέγραψε τη δράση της μαστίχας Χίου στην ανάπλαση του δέρματος.
- `public/philosophy.html:10` — `p` [sensory]: Οι περισσότερες κρέμες σήμερα είναι γεμάτες συνθετικά και τεχνητά αρώματα που ούτε μπορείς να προφέρεις.
- `public/philosophy.html:11` — `h2` [ingredient,count]: Δεν χρειάζεσαι 30 συστατικά.
- `public/philosophy.html:15` — `img@alt` [sensory]: Κοντινή λήψη της υφής του balm μέσα σε μαύρο δοχείο

### public/privacy.html — 1 matching locations

- `public/privacy.html:3` — `p` [sensory]: Ο κώδικας αυτής της ιστοσελίδας δεν εγκαθιστά cookies ανάλυσης ή διαφήμισης και δεν χρησιμοποιεί εργαλεία παρακολούθησης. Οι γραμματοσειρές και τα πολυμέσα φιλοξενούνται μαζί με τον ιστότοπο.
