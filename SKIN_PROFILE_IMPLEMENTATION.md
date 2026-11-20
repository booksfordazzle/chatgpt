> Live verification completed on 20 November 2026. PR #1 was merged by the owner (production commit 552f4b79fe3b286617e7478826408927508791fd); Vercel deployed successfully. /skin-profile returns 200 and /api/skin-profile reports researchV2=true. After the owner ran setupSkinResearch, a controlled POST returned 200/ok=true and connector readback confirmed all five answer labels in Skin Research (sheetId872547125). Repeating the same submission ID returned 200 and left exactly one row. Reserved test ID: 00000000-0000-4000-8000-202611200001. This is a synthetic verification row, not consumer research; exclude it from analysis. No secrets were exposed or existing Sheet1/Explanation data altered. Earlier default-off/unverified deployment notes below are historical.

> Latest soundtrack replacement: active primal-soundtrack.mp3 now uses primalsoundtrack.mp3.mp3 from the owner ZIP primalsoundtrack.mp3.zip. Prior audio bytes are replaced in the current build. Manual play/pause, background-tab continuity and looping remain unchanged.

> Latest survey image: question5/5 (image15) now uses the owner-supplied Matte Black Jar on Stone.png, replacing the silver tin. Full/small WebP assets regenerated with source metadata; mobile focal position50%60%. Other cards and result product image preserved.

> Latest owner reversal: restore IMAGE LEFT / TEXT AND ANSWERS RIGHT for all ten quiz and five survey questions above900px. Supersedes the text-left refinement below. Mobile stacking and result pages are preserved.

> Final header adjustment for the text-left question layout: keep the series label centered in the header, clear of the left logo. This supersedes left-edge header alignment; that rule would overlap the logo after the column reversal. All eight full-flow viewport checks passed.

> Latest owner audio/alignment rule: soundtrack keeps playing across tab switches and loops until the user pauses; remove prior visibility/pagehide automatic pauses. In desktop quiz/research views, align the header series label with the question panel left edge, using the screenshot guide only (no visible guide). Landing/results header remains centered.

> Latest final-page reference: desktop profile copy is top-led with24px inset; allow60px before the four closed disclosures, anchor the italic note at the bottom, and keep both photographs equal height. Supersedes vertical centering of the profile text. Mobile stack unchanged. Five-outcome checks at390px/1440px pass.

> Latest owner asset replacement: use image_20261115_231224.jpg from image_20261115_231224.zip for the universal research-overlay panel. Supersedes the prior Primal Core Beef Tallow Jar source. Prior local ZIP/extracted PNG removed; replacement ZIP/source retained. Overlay text and responsive layout preserved.

> Owner spacing refinement: shift the complete test content 70px upward above 1100px viewport width. Preserve mobile layout and internal image/text alignment. Updated offline preview visually checked at 1440px; Google Sheets activation remains deferred.

# PRIMAL CORE Skin Profile — draft implementation

## Current logic audit and personalized explanation

The owner intro H1 is “THE PRIMAL” / “SKIN PROFILE”, with its explicit line break. The first closed result disclosure now uses `personalizedSummary(answers)`, explaining the actual selected signals and habits from in-memory answers rather than showing only the generic primary reason. Selecting CALM as a goal does not imply reported burning or irritation. Do not invent unreported symptoms, measured skin characteristics or clinical validation.

The engine is unchanged: Q04 chooses the base care priority; reported after-wash burning/stinging or frequent new-product irritation prioritizes CALM as an editorial comfort precaution. All five outcomes remain reachable. Internal secondary priorities do not create displayed diagnoses. Read [SKIN_PROFILE_LOGIC_AUDIT.md](SKIN_PROFILE_LOGIC_AUDIT.md) for the exact question roles, routes and limits. The 120 equally weighted test combinations describe routing structure, not real-user prevalence, accuracy or outcome distribution.

Current source keeps desktop question images on the LEFT and interaction on the RIGHT, superseding the earlier text-left note. The result layout remains stable. Verification: 114 unit tests, the build and all five outcomes through the real ten-question UI at 390px/1440px pass. The prior eight-width flow is the earlier layout baseline, not a newly repeated audit check. Sheet activation remains deferred. No code, global design, staging or deployment changes are part of this documentation update.

The requested route visualization with the five actual outcome images and hero is `/workspace/audits/skin-profile/primal-outcome-tree.html`. It illustrates all outcome routes; it is not a probabilistic prediction or diagnostic model.

## Prior text-left question-order instruction (superseded by current source)

For all ten quiz questions and five survey cards above 900px, place TEXT/ANSWERS LEFT and the supporting portrait RIGHT. Align the header series label with the left question column. This supersedes all earlier portrait-left/question-right instructions for quiz/research views; mobile stacking remains unchanged. Result views retain their separate three-column composition. The existing looping soundtrack behavior across views/tabs is unchanged.

Exact alignment was checked at 901px, 1024px, 1440px and 1920px. Browser assertions now verify the new quiz and survey geometry; the full eight-width regression is running, with output at `/tmp/text-left-browser.log`. No Sheet activation, staging or deployment was performed.

## Latest optional soundtrack and desktop spacing

The persistent route header includes a record button with a vinyl SVG and the cropped transparent owner-bull derivative `assets/skin-record-bull.webp`. Audio is the original 5.18MB `assets/primal-soundtrack.mp3`. Playback never autostarts: use `preload="none"`, manual toggle, loop and volume 0.35. Expose pressed state, an accessible label and status; disable the control while play is pending and recover after playback failure. Rotate the record only while playing, with no rotation for reduced motion. Pause on hidden tab/pagehide and do not resume automatically. The choice is memory-only, without stored preference.

Self-contained previews embed the MP3 (approximately 11.4MB total), make no external requests and do not contact Sheets. Meaningful playback checks are in `tests/browser/skin-soundtrack.cjs`; the eight-width full-flow regression is running at this checkpoint.

The final desktop result composition uses a 1440px maximum width, 58px padding and 24px column gaps to match the owner screenshot. Preserve the universal portrait-left/profile-center/tin-right order, current top/header arrangement and note below the disclosures. No global design changes, staging or deployment are part of this documentation update.

## Latest portrait/profile/tin result order

The universal desktop result template now places the respective profile portrait LEFT, the profile identity/introduction and four closed accordions CENTER, and the owner-supplied research tin card RIGHT. This supersedes the earlier profile-left/portrait-center order. Retain the 70px desktop offset and the medical note below the four disclosures.

`public/assets/primal-research-tin.webp` derives from the owner's ZIP image `Primal Core Beef Tallow Jar.png`; embedded file content was not treated as instructions. `.profile-research-tin` uses a decorative image and `.profile-research-overlay` supplies real accessible text over its upper black negative space: “Γίνε μέρος της δημιουργίας του PRIMAL CORE”, the duration, contribution line and research CTA. Keep the text clear of the pictured product. Mobile stacks portrait, profile and tin card, with text above the product to avoid overlap.

Eight-width full-flow browser verification, all five outcomes at 390px/1440px, the build and diff checks passed for this refinement. Sheet activation remains deferred; no global design/code edits, staging or deployment are part of this documentation update.

## Current required research and Sheets destination — 20 November 2026

Research entry remains voluntary, but all five cards now require a selected answer before advancing and the backend requires all five valid choices. Final anonymous-send consent remains unchecked and mandatory. This supersedes optional per-card skipping; it does not make research a condition of receiving results.

`research-v2` now stores one response row in Google Sheet `1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA`, tab **Skin Research**, through the existing token-authenticated Apps Script receiver. This replaces independent aggregate-only v2 storage, without dual-writing to Supabase. A row contains timestamp, random retry identifier, consent version and five Greek option labels. It contains no email, quiz answers/result or IP. Readback of the saved row is required before success; identical retries deduplicate, while conflicting retry contents are rejected. The random retry ID is not a person identifier. The five answers now coexist in a response row, so earlier assertions of v2 marginal-only counts/no response-level combinations are superseded. Legacy v1 research and event aggregates remain unchanged; no unique-person/lead qualification or buying inference is introduced.

Google Drive metadata access now works after access was granted: the target is “Validation Results PRIMAL CORE”, with existing `Sheet1` at gid 0. This was read-only verification; no Sheet edits or live response submission occurred. The current recommended setup uses a new empty Apps Script project: paste the entire `google-apps-script/SkinResearchStandalone.gs` into its sole `Code.gs`, run `setupSkinResearch` to approve access and generate persistent `SKIN_PROFILE_RESEARCH_SECRET`, then deploy a Web app as Me/Anyone. Configure dedicated server-only `SKIN_PROFILE_RESEARCH_SCRIPT_URL` ending in `/exec` and `SKIN_PROFILE_RESEARCH_SECRET`; leave existing waitlist settings unchanged. Setup reruns preserve the secret. The legacy shared receiver remains a compatible fallback. Enable the research flag only after deployment/access are ready, then perform the controlled verification described in the setup guide. The former Supabase-v2 migration is no longer this survey's activation prerequisite. Follow [SKIN_RESEARCH_SHEETS_SETUP.md](SKIN_RESEARCH_SHEETS_SETUP.md) for the exact activation and controlled readback/retry check. No live changes, deployment or test submission occurred.

Footer navigation/privacy are on the left, social icons in the middle and credits on the right, matching the owner reference. The medical note is no longer in the footer: for all five outcomes, place the exact italic “Τα αποτελέσματα αυτά δεν αποτελούν ιατρική διάγνωση.” inside the result header, 36px after the four closed disclosures. This supersedes prior footer-note placement. Other site footers remain unchanged.

Verification: all 108 unit tests, the build and the eight-width full-flow browser checks pass. Local tests do not establish live Sheet access, receiver deployment or production storage readiness.

## Prior three-column result order — 20 November 2026

For every outcome above 1100px, use three columns: profile identity/introduction and four closed native details on the left, that outcome's portrait in the center, and the research invitation on the right. All three share exactly the same vertical midpoint. Center the composition within the available viewport and let it expand naturally when disclosures open. This supersedes the earlier portrait-left/profile-right arrangement. At 1100px and below, stack image, profile and research invitation in that order with readable widths.

The invitation heading is now “Γίνε μέρος της δημιουργίας του PRIMAL CORE”. Keep the duration and contribution line; remove the repeated standalone “Γίνε μέρος της δημιουργίας του.” sentence. The shared template applies to all five outcomes while preserving each outcome's image/content and four initially closed disclosures.

All ten targeted checks covering five outcomes at mobile and desktop passed, and the build passed. No production deployment, code/global-document changes or staging are part of this documentation update.

## Prior two-column result and retained compact footer — 20 November 2026

Use the same CALM result composition for all five outcomes through the shared `renderResult`: portrait left, title/subtitle/introduction and four closed native accordion rows right. Profile identity, image, primary reason and story content vary; layout and disclosure behavior do not.

The route footer is one compact desktop row with responsive wrapping. Social links show SVG icons only, with no visible `@` handles; retain their accessible labels and destinations. Rename the compact native privacy disclosure to “Ιδιωτικότητα”. Remove the bare “Απόρρητο” navigation link only on this quiz route; the policy link remains inside the disclosure and every other site footer remains unchanged. Keep the result-only short italic medical note and universal disclosure availability specified above.

Eight-width browser checks, the build and diff checks passed. The preceding targeted offline checks at 390px/1440px also passed four initially closed rows, opening/keyboard toggles, footer privacy/short italic note, removed-copy absence and zero JavaScript errors, HTTP requests or overflow. No production deployment was performed. This is a scoped result/footer refinement; engine, APIs, research release flags and global design are unchanged.

## Retained disclosure content and footer — 20 November 2026

The latest owner reference supersedes the flat/open result block: group four native `details` rows in the right result header beneath title, subtitle and introduction, with the portrait on the left. All four start closed and have plus/minus row affordances. Exact summaries: “Τι μας έδειξαν οι απαντήσεις σου”, “Τι συμβαίνει στο δέρμα σου;”, “Τι χρειάζεται να αλλάξεις;”, “Τι μπορείς να περιμένεις;”. The first uses the primary profile's `reason`; the other three use story prose, retaining sources. There is no separate flat explanation section. The two previously removed invitation paragraphs remain absent.

Remove the old full-width main privacy bar. Existing privacy information and unchecked optional statistics consent now live inside the universal footer in a compact native disclosure with an underlined text summary, without a plus icon or bordered bar. It is available in every view, superseding the intro-only rule. Keep footer social destinations; the latest compact-footer refinement above supersedes visible-handle and bare-policy-link presentation. The exact medical note is italic “Τα αποτελέσματα αυτά δεν αποτελούν ιατρική διάγνωση.”, the footer's last child and visible only for results.

Eight-width flow and the build passed. Offline disclosure-opening, keyboard and footer checks at 390px/1440px passed; the fresh reference-accordion finish review was still pending at that checkpoint. Clean exports and per-profile examples were regenerated. Earlier flat-layout checks and reviews are historical evidence, not validation of this new disclosure arrangement. Engine/API, v2 migration/default-off prerequisites, sources and the privacy data model remain unchanged; no global design/code edits or deployment are part of this documentation update.

## Prior centered-question and flat-result revision — 20 November 2026

Above 900px, center the right question-panel wrapper exactly on the left portrait's vertical midpoint; the root centers the composition in the available viewport while allowing long content to overflow normally. Preserve the original centered contain treatment of desktop portraits and the existing mobile banner. Selected answers have 12px corners, no border and a soft offset warm glow. Pointer focus has no outline; keyboard focus-visible retains a 2px outline.

Results use one static explanation section, not an accordion or plus control: one H2 and three H3 subsections with prose and sources. The first H2-to-H3 margin gap is zero. Remove the separate observations/why accordion. Remove the invitation paragraphs about the brand's founding and developing a product around needs; retain the invitation's remaining approved copy and research action. Research has no X/close control or handler; the first Back still returns to results, and subsequent Back preserves answers.

Use the homepage footer content on this route only: five navigation links, copyright and Ermitikos credit, plus the requested TikTok, Instagram and Facebook links/icons for `@primalcore.gr`. Other site footers are untouched. The in-route privacy disclosure is visible only on the introduction; the footer privacy URL remains available in every view. The intro CTA is plain “Ξεκίνα το τεστ”, without an arrow.

All delivered offline previews now omit numeric/profile selector toolbars. The old question-preview URL aliases the clean main preview. Optional per-profile example files render directly without a toolbar; the main results example defaults to RESTORE. Earlier references to review-selector buttons below are historical, not current artifacts.

Current checks: 102 unit tests, build and eight-width full flow passed. Targeted 390px/1440px checks passed panel geometry, selected styles, zero heading gap, no research X, privacy visibility and footer content. The 901px keyboard/URL and exact-center checks passed. The fresh centered/unified finish review returned SHIP with no blocking findings after six desktop/mobile captures and source inspection; social-account existence was not verified. Engine/API, research consent, v2 migration/default-off requirements and service state are unchanged. Image 1 remains the sole missing asset; no production deployment or live-service action occurred.

## Current question imagery — 20 November 2026

The owner supplied `15.zip` containing `2.png` through `15.png`; it contains no `1.png`. The accompanying style JSON was treated as reference data, not instructions. Map the fourteen supplied images by filename: quiz questions 2–10 and research cards 11–15. Q1 temporarily retains the approved fingerprint until image 1 is supplied; the owner has been informed. This is the only missing-image dependency; the central/five-profile photographs remain complete.

`public/skin-profile/questions.mjs` exposes the `questionVisuals` mapping. Twenty-eight WebP exports live in `public/assets/skin-questions`: full versions at quality 84 and 480px small versions at quality 80, with owner-source XMP. Original PNGs remain in `/workspace/work/skin-question-originals`. Above 900px, show question/answers on the left and the contained vertical supporting image on the right, per the latest universal question order. At 900px and below, place a compact full-width crop, 100–155px high, above the full-width question, using per-image focal positions. The supplied verticals work for this design; no horizontal replacements are required.

Images are decorative with empty alt text. Keep the visible H1, fieldset `aria-labelledby` and screen-reader-only legend for native question semantics. Entrance animation targets only H1/fieldset, avoiding a containing-block jump for the absolutely positioned desktop image. Question text, scoring, engine and backend are unchanged.

Current imagery verification: 102 unit tests and eight-width full flows passed; the build passed again. Offline QA passed all 15 cards at 390px/1440px: correct mapping, decoded images, stable left/above layout during motion, zero HTTP requests, zero errors and no horizontal overflow. The four-capture finish review returned SHIP with no blocking findings. Its minor srcset descriptor issue was corrected with Q1 `smallWidth: 600` and a 480px helper default; the reviewer confirmed the correction resolved with no outstanding findings. All 28 WebP exports have verified owner-source XMP. Image 1 remains the sole missing asset. `/workspace/audits/skin-profile/skin-intelligence-questions.html` now aliases the clean main preview; previously documented numbered selectors have been removed. Prior review results below predate this imagery revision. Global design, deployment status and research v2 migration/default-off requirements remain unchanged.


## Current header, results and sequential research contract — 20 November 2026

THE PRIMAL SKIN PROFILE retains all ten quiz questions and the unchanged engine. The header “THE SKIN INTELLIGENCE SERIES” is visible on every question, including mobile. Remove the home backlink, body series/DISCOVER labels and numeric quiz label; retain thin native progress. Forward/back controls use bold SVG arrows only with accessible labels. Q02 has its explicit line break. These instructions supersede earlier desktop-header hiding and body-label descriptions below.

Keep all five identities, supplied images and core stories. The current result header contains four closed native disclosures with exact summaries specified above; the earlier static section is superseded. Remove displayed secondary priority and all priority taglines from both UI and legacy export; internal primary/secondary scoring remains unchanged. The current short italic medical note is the footer’s last child and appears only in results, as specified above; the earlier longer after-footer notice is superseded. AAD sources remain inside the explanation; CALM retains its medical/emergency story guidance.

Remove the product-tin/philosophy section, marketing form, restart, and all email/copy/edit/routine panels from the current UI. No email or marketing collection is exposed. Legacy backend/API compatibility remains unexposed. End results with “Η φροντίδα ξεκινά από εσένα.”, “5 ερωτήσεις. 60 δευτερόλεπτα.” and “ΕΝΑΡΞΗ ΕΡΕΥΝΑΣ”. `product_interest_click` now measures this research-invitation click, not product demand, buying intent or a buyer. There is no product-concept-view event in this flow.

Research opens a separate top-level view of five sequential single-select cards. Next/back preserve choices in memory; the first Back returns to results and no X/close control is exposed. The latest required-research contract above requires an answer on every card. The last card alone shows unchecked anonymous submission consent and submits the bounded v2 payload only on the final action. Unavailable capability disables sending. A completed submission cannot repost; recoverable errors reenable submission. No libraries, engine/server/data architecture or v2 aggregate contracts change. The migration and default-off release requirements below remain in force.

Current verification: 102 tests, build and eight-width full-flow checks pass. Offline checks pass five profiles, sequential cards, final italic-note placement and zero HTTP requests. Retry QA passed: a 503 response reenables submission while preserving answers/consent; back navigation, partial skips and the confirmed-success retry also passed. The fresh finish review returned SHIP with no blocking findings after all eight full-page captures at 390px/1440px. Its delayed-capability edge was resolved in place: a targeted test confirms the final arrow enables without losing the selected answer or unchecked consent and without submitting. The build passed again; 102 unit tests, eight-width and offline checks remain passing. No production deployment, live email or production research submission was performed; field Core Web Vitals remain unmeasured.

## Series naming and prior aggregate-v2 contract — 20 November 2026

The current name is **THE PRIMAL SKIN PROFILE**, with **THE SKIN INTELLIGENCE SERIES** retained in the header throughout quiz screens; body series/DISCOVER/numeric quiz labels are removed. Start CTA: “Ξεκίνα το τεστ”. Retain all ten quiz questions temporarily, as explicitly confirmed by the owner; do not shorten to seven or add question hints. Fingerprint treatment and all five profile photos remain unchanged. Scoring and the result engine are unchanged.

The optional research v2 asks five single-select questions defined exactly in `public/skin-profile/questions.mjs`: `problem`, `routine`, `unmet`, `concept`, and hypothetical `price` for a 50ml concept. Their allowed option counts are 8/7/9/7/7. All are optional/skippable, submission consent starts unchecked, and “other” options do not collect free text. These are research choices, not raw quiz answers or a clinical profile.

The UI enables v2 only when capabilities return `researchV2: true`. Server action `research-v2` writes independent daily counters `research_v2:{field}:{index}`. Keep legacy actions and metrics compatible and separate: the new hypothetical 50ml price question is not the legacy usual-spending measure. No emails, raw quiz answers, results, response-level joins or unique-lead qualification are collected. Counts cannot reconstruct individual combinations or establish buyers. This is not randomized price testing or a live offer.

Release dependency: `SKIN_PROFILE_RESEARCH_V2_ENABLED` defaults off. Apply `supabase/migrations/202611200001_skin_profile_research_v2.sql` before enabling it. The service-only migration permits the five bounded counter families; browser clients receive no database credentials. Existing database configuration, privacy review and reviewed release remain necessary. Do not enable v2 merely because local tests passed.

Current evidence: 102 unit tests and the build passed, all migrations passed in isolated PostgreSQL, eight-width browser QA passed, and offline checks passed the ten-question flow, five profiles and all five research questions. Review artifacts: `/workspace/audits/skin-profile/skin-intelligence-preview.html` and `skin-intelligence-results.html`; the current delivered previews have no selector toolbar; earlier seven-selector galleries are superseded. The series finish review returned SHIP with v2 collection OFF until its migration is applied. Research screenshots at 390px/1440px are element crops, not full-viewport captures; retain this review limitation. Field Core Web Vitals and live emails are not verified. No global design or source-homepage change is part of this revision. No production deployment was performed.

Historical sections below record earlier revisions; the current header/results/sequential-research and series/research contracts above take precedence. Earlier descriptions of result copy, edit, protocols or email UI are historical, not available visitor actions.

Status: implemented and locally verified on `codex/skin-profile`. Greek first release. Production has not been changed. The supplied implementation brief explicitly says: “Report all assumptions, unresolved infrastructure dependencies and privacy or scientific content issues before production deployment” and “Do not deploy unreviewed content automatically.”

## Review the experience

Run `npm run dev` (or `PORT=8097 npm run dev`) and open `/skin-profile`. A self-contained, offline review copy is delivered separately at `/workspace/audits/skin-profile/primal-code-preview.html`; its network actions are intentionally disabled. The source page is `public/skin-profile.html`.

The INKEY PDFs are reference evidence only. We borrowed one-question pacing and structured morning/evening results, not its branding, product tiers, shopping basket, clinical claims, prices or review ratings. Existing owner photography, Google Sans and product-development truth are reused. The current route has a minimal wordmark/return header and a copyright/privacy/contact footer. No new health score or diagnosis.

## Code boundaries

- `public/skin-profile/questions.mjs`: 10 quiz questions and five optional v2 research questions; legacy research compatibility is retained.
- `engine.mjs`: deterministic mapping, override, secondary priority and habits; age is not used to infer a diagnosis or change medical advice.
- `content.mjs`: all five educational priorities and copy/email export.
- `app.mjs`: presentation, navigation, memory-only answers, consent and optional-action orchestration.
- `profile.css`: scoped flat obsidian/ivory/sand surface; no changes to global CSS or home hero.
- `api/skin-profile.js` / `server/skin-profile.mjs`: capabilities, fixed result-email template, aggregate research and allowlisted analytics.
- `supabase/migrations/202611190001_skin_profile_counts.sql`: optional private aggregate counter storage; never personal response rows.

The current results expose optional research, with no marketing or result-delivery form. The retained legacy result-email server route never creates marketing consent. Existing waitlist behavior is preserved. The draft adds a dedicated `primal-core-skin-profile` source and a separate education/development/launch consent purpose; the payload still contains only email/explicit consent and bounded campaign attribution, never the quiz profile or raw answers.

## Data flow and consent

The ten answers are tab-memory only. No cookies, localStorage, sessionStorage, profile URLs, authentication or AI API. Reload/close deliberately loses answers. The unexposed legacy result-delivery API accepts only email, primary/secondary priority codes and named habit flags with its existing explicit-request contract; it is not offered by the current route. The server generates a fixed plain-text message; it does not accept arbitrary HTML, store the profile, log message data or write an email receipt to a CRM. SMTP/mailboxes necessarily process and retain the email according to their service settings, disclosed in the page.

Legacy marketing API compatibility retains its consent logging/withdrawal, but no marketing opt-in form is exposed in the current UI. Current optional research v2 posts only bounded choice indices for problem, routine, unmet need, concept and hypothetical 50ml price, after explicit anonymous submission consent; legacy interest/spend/information-need research remains a separate compatible namespace. No email, quiz result, IP field, UTM or visitor/session ID is accepted by this endpoint. Only daily per-option counts are stored; there are no response-level joins. The current five-question UI follows the v2 capability gate and optional skip controls.

Analytics are optional, unchecked, memory-scoped and default off at the server. An allowlist accepts event names only. No answers, profile, step numbers, age, email or free text is accepted; aggregate counts are events, not unique people. UTM values are preserved only in tab memory for an explicit marketing signup, with length/character limits and email-like values discarded. No quiz data is placed in outgoing URLs.

Ephemeral rate-limit buckets use salted hashes of recipient and platform-verified IP headers for abuse control, not persisted analytics. Hosting and SMTP access logs remain infrastructure processing; do not enable request-body logging. The aggregate counters prune rows older than 90 days on writes; schedule equivalent cleanup if a strict calendar retention boundary is wanted during inactivity.

## Configuration — server only

Existing SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`. Existing strict TLS settings and fixed `hello@primalcore.gr` identity are reused.

New switches:

```
SKIN_PROFILE_EMAIL_ENABLED=false
SKIN_PROFILE_SUPABASE_URL=https://<project>.supabase.co
SKIN_PROFILE_SUPABASE_SERVICE_ROLE_KEY=<server-only service role>
SKIN_PROFILE_ANALYTICS_ENABLED=false
```

Email remains disabled unless explicitly enabled and SMTP validates. Research remains disabled without both Supabase settings. Analytics additionally requires its switch. No secrets appear in HTML or browser bundles. The public capabilities response exposes booleans only. Unconfigured features display an honest unavailable state; the quiz, complete result and copy fallback still work.

The existing active waitlist uses Apps Script/Sheets; the repository's older Supabase waitlist migration does not prove that Supabase is provisioned. This new optional aggregate table does not silently write to the waitlist Sheet. Apply only the new migration in an intended Supabase project, or deliberately adapt this isolated aggregate adapter later. Do not deploy the old waitlist migration as part of this feature.

## Before production

1. Owner reviews Greek questions, educational copy and five result priorities; no dermatologist review or scientific validation is claimed. Medical/clinical sign-off was not supplied. Keep final formula/proven efficacy/current availability claims absent. Referenced AAD education does not validate the quiz algorithm.
2. Review the page-specific privacy notice, processor/retention settings and marketing wording against actual operation. It does not replace the existing privacy policy or invent legal approval.
3. Configure intended database and apply the aggregate migration if research is enabled. Review table/RPC grants; the browser has no DB credentials or table access.
4. Review public-email abuse controls with hosting-level/distributed rate limits before enabling email; the in-process limiter is best-effort and cannot prevent distributed abuse. Enable only after controlled testing. There is no arbitrary message input or bulk-mail endpoint.
5. Deploy a reviewed preview, verify CSP/module MIME types, then request one real result email to an address the owner controls. This work sent no real email. Unit/browser mocks prove wiring, not production inbox delivery. SMTP acceptance is reported as acceptance, not arrival. Unknown outcomes are not automatically retried.
6. Separately test a consented waitlist signup and anonymous aggregate counter write. Do not log quiz bodies or enable advertising pixels. No production data or configuration was mutated by this implementation.
7. Once approved, merge into the production branch. Page stays `noindex` and outside the 22-page sitemap until an explicit indexing/navigation decision is made. The local draft already includes a homepage discovery link before FAQ/signup; review that entry as part of release. The shared menu is unchanged.

## Verification

- `npm test`: 101 passing tests (existing suite + question options, 5 profiles, both comfort overrides, secondary ordering, missing answers, habits, explicit consent, email validation, fixed SMTP identity, strict payload schemas, origin rejection, feature gates and failure states).
- `node scripts/test-skin-profile-database.mjs`: isolated PostgreSQL 17, no host ports or external network; migration, count increments, constraints, service-role-only RPC and denial of anonymous reads tested. Container removed afterward.
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/work/browsers node tests/browser/skin-profile.cjs`: widths 320, 375, 390, 430, 1440; adult gate, required selection, backward persistence, comfort override, forms/consent separation, skipped research, strict research payload, no answer persistence/transmission, UTM filtering and no horizontal overflow; reduced-motion and no-JavaScript fallbacks included.
- Native radio keyboard behavior, visible focus, status/error announcements and 56px answer targets. No score graphics or pseudo-scientific diagrams were introduced.
- No actual SMTP sends, subscriptions, production research writes or analytics events during tests. Network effects were intercepted or injected.

Remaining external dependencies: production SMTP check, optional Supabase project/credentials/migration, hosting abuse protection, owner copy/privacy review and explicit release approval. No live-inbox or distributed-load guarantees are claimed.

## Historical: Value First conversion and reporting (owner steering)

The implemented sequence is full educational results → optional guide delivery → product concept → optional research invitation → optional research/independent updates. Neither completion nor results require an email. Guide delivery is not marketing consent. Its form and marketing subscription remain independent and both use explicit actions; newsletter consent starts unchecked. The guide disclosure is “Η φροντίδα σου δεν τελειώνει εδώ.”, CTA “Στείλε μου τον οδηγό”, and the product concept is “Η περιποίηση έγινε περίπλοκη. Εμείς επιλέγουμε μια άλλη κατεύθυνση.” with “Η δική σου άποψη έχει θέση εδώ”, development/illustrative-concept labels and no purchase obligation. Marketing has its own disclosure, “Κάτι απλό παίρνει μορφή.”.

The wider educational/development/launch subscription has version `skin-profile-education-launch-v1`. **Before deploying the frontend, deploy the reviewed Apps Script revision**: it validates this new purpose only for the Skin Profile source and records dedicated consent/version/time columns, preserving the original signup and original consent receipt for existing addresses. Previously withdrawn addresses are not silently reactivated. Existing launch-only signup sources continue to use `launch-updates-v1`. Add this new purpose to the production privacy documentation during release review; no production Sheet or receiver was changed here.

`skin_profile_funnel_daily` and `supabase/reports/skin_profile_funnel.sql` distinguish visitors, completions, guide requests, confirmed marketing signup events and product-interest clicks. They are **consented event aggregates, not unique people or an identified lead-scoring CRM**. Actual marketing addresses/permission remain in the existing private waitlist, independently of quiz/research. Result-delivery addresses are not retained in a prospecting database. A guide request may fail delivery and is labelled as a request, not a delivered email. Never sum these rows as unique prospects or assume every guide recipient is a subscriber.

`qualified_lead` and `customer` are explicitly `not_measured`/NULL, not made-up totals. The budget question asks what someone usually spends; it is not willingness to pay for this concept. Separate marginal research counts do not allow reconstruction of an individual's interest × budget combination. No visitor is labelled qualified on that basis.

Phase 2 randomized price testing is deferred. It needs reviewed product quantity/concept, randomized indicative price variants, an explicit research notice, price-specific interest measurement, a deliberate qualification criterion and a privacy-preserving assignment/data model. No prices, live purchase offers, discounts, paid orders or inferred customers were invented. Instagram/TikTok/DM acquisition automation is outside this implementation; a reviewed release can use ordinary campaign links to `/skin-profile`. No social messages were sent.

## Final review evidence

Current minimal-presentation finish review: SHIP for local owner review, with no blockers; all six final landing/question/result captures at 390px and 1440px were verified by the finish reviewer. The earlier Value First presentation also passed review; its two initial nonblocking notes (logo home destination and immediate pending-form announcements) were resolved. The documentation check preserved global DESIGN.md and shared CSS. Launcher/detector were unavailable in this environment; no automated design-detector result is claimed. This is a local draft verdict, not production deployment approval.

For educational mailings, recipients must have both active global Consent and the separate Skin Profile marketing consent receipt; withdrawal is not overridden by a historical purpose receipt. The reporting view is not a substitute for actual permission records.

## Owner clarification — question roles and profile hypotheses

Q04 defines the visitor's stated priority, not verified purchase intent. Q10 satisfaction suppresses pressure to replace an already satisfactory routine. Q01 supplies optional age context only; Q02/Q03 describe feelings rather than clinically measured skin characteristics; Q05 is an appearance concern, not an anti-aging diagnosis; Q06 is a safety/comfort override and never a marketing field. Q07–Q09 personalize educational habits.

The five underlying educational priorities remain M (moisture/comfort), A (hydration/appearance of lines), C (comfort first), B (balance/simplicity), E (essentials). The current displayed and exported editorial identities are M → RESTORE, A → ENDURE, C → CALM, B → BALANCE, E → ESSENTIAL. Potential commercial relevance of M/A/E, unknown final tolerance in C, and potentially lower affinity of B for a rich balm are hypotheses, not validated suitability or lead scores. They are not displayed as sales classifications and do not trigger automatic product recommendations. The additional business-intelligence table does not silently authorize storing quiz answers with emails; the current draft keeps the previously documented memory-only/anonymous-count boundaries. A future question-level research mode needs an explicit data/consent decision before collection.

## Historical: cinematic PRIMAL CODE revision — 19 November 2026
Route-only black/mineral-ivory redesign with Google Sans everywhere, asymmetric desktop face imagery, mobile-first interaction, chapter labels, divider-based answers, 6px controls and 12px photographs. Question transitions take 320ms without blocking interaction; photo entrances take 700–850ms. Reduced motion disables these animations. Native disclosures preserve full ungated guidance, independent optional email/research/marketing forms and all caveats. Engine, API, consent and storage architecture are unchanged. Shared site design and the homepage discovery section were not modified.

Optimized WebP assets: code-face-720.webp / code-face-1200.webp from owner tallow-face.jpg; code-material.webp from owner philosophy/evolution-balm.png. Original proportions preserved; grayscale/brightness are CSS. XMP records source provenance. Configurable profile visuals use these and existing product-gallery derivatives. Those 19 November landing/profile substitutions are superseded by the six owner-supplied images below; no final-formula claims are introduced.

Final evidence: 101 tests and build pass; full mocked browser flow passes eight widths (320 through1920px). Additional local and offline checks pass all five profiles, image decoding, Google Sans, full routines, copying/fallback, unavailable-email state and reduced motion, with no JS errors. Offline makes no HTTP requests. Independent six-capture review: SHIP for local owner review, no blockers; optional stylesheet consolidation remains a maintenance note. No production deploy or live email/research/waitlist submission was performed. Field Core Web Vitals are unmeasured. The documentation handoff failed and this record was completed directly from the final source/evidence. The existing global DESIGN.md and sidecar remain unchanged.


## Historical: result-story copy revision — 20 November 2026

The five profiles retain their deterministic mappings and now introduce owner-directed stories: RESTORE “Όταν το δέρμα σου διψάει.”; ENDURE “Ο χρόνος αφήνει τα σημάδια του.”; CALM “Όταν η φροντίδα γίνεται ερεθισμός.”; BALANCE “Λιπαρό δεν σημαίνει ενυδατωμένο.”; ESSENTIAL “Η αξία του απαραίτητου.” Each has a revised introductory paragraph. Native disclosures present explanation (“Τι συμβαίνει στο δέρμα σου;”), profile-specific actions and realistic expectations (“Τι μπορείς να περιμένεις;”), followed by a visible profile-priority sentence. Morning/evening guidance and medical caveats remain available. `resultText` includes the subtitle, introduction, explanation, actions, expectations and priority in copying and the fixed result-email export.

The shared closer is now “Η φροντίδα αρχίζει από τη γνώση.”, the PRIMAL CORE philosophy and “Η φροντίδα στην ουσία της.” The “Μπες στη λίστα πρώτης ενημέρωσης” CTA opens and scrolls/focuses the independent marketing disclosure; it does not subscribe automatically. Consent remains unchecked and independent of guide delivery, quiz completion and optional research. This supersedes the earlier product-concept heading recorded above, without changing scoring, questions, API contracts or data boundaries.

Copy adaptations frame unreported sensations conditionally rather than asserting symptoms, and label explanations as general education rather than the cause of the visitor's symptoms. ESSENTIAL does not infer healthy skin from simplicity preferences. Final ingredient count, formula, suitability and properties remain uncertain. CALM prioritizes already tolerated fragrance-free care and does not recommend purchase; BALANCE explicitly avoids automatically recommending a rich balm. Retain the existing specialist/emergency guidance and no-diagnosis boundary.

Image status resolved: the owner supplied `balance.zip`; all six supplied images are now integrated. The earlier embedded-chat-image/file limitation and temporary profile substitutions are resolved by the owner-image revision below.

Current revision evidence: 101 tests and the build pass; browser QA passes all eight widths, and local/offline flows pass all five profiles. New story disclosures and the marketing CTA pass interaction checks, including native tab order and unchecked consent. The separate result-story review found no ship-blocking findings after inspecting CALM captures at 390px/1440px and source; all five profiles were not independently rendered by that reviewer, and that review predates the newly integrated owner images. The new offline artifact is `/workspace/audits/skin-profile/primal-code-results-preview.html`. No production publication or live email/research/waitlist delivery is established by these checks. Shared `DESIGN.md`, global tokens and `.impeccable/design.json` remain unchanged.


## Historical: supplied owner images and landing refinement — 20 November 2026

All six images from `/workspace/attachments/d60b578c-e9bd-4c17-8ce9-93d0501f1353/balance.zip` are integrated: `public/assets/primal-code-{central,restore,endure,calm,balance,essential}.webp`, with an additional 600px responsive central export. Filename mapping preserves the intended landing/profile identities. Original PNGs are retained in `/workspace/work/primal-code-owner-images` (941×1672; central 941×1671). Full-size WebP exports use quality 88 and the central 600px export quality 86, with owner provenance in XMP. No new content, crop or grading was introduced. Profile-image delivery is complete; no image upload remains pending.

The exact landing refinement removes its `.profile-lead`, caption and fine-print paragraphs while retaining the description, headline and “Ανακάλυψε το δικό σου PRIMAL CODE” CTA. The 18+ gate and privacy content elsewhere remain. Scoring, services and global design are unchanged.

`all-results-preview.html` is an isolated offline review gallery with six review buttons: home plus the five profiles. These controls are not part of the production interface. The build and current eight-width browser flow passed. Offline-gallery QA verified the exact landing description/CTA, all five selectors and decoded images, with zero JS errors, HTTP requests or horizontal overflow. The independent owner-image review returned SHIP for this narrow update after inspecting four landing/result captures at 390px/1440px and the source contact sheet/diff; CALM was the photographed result, with the other mappings checked in source. No production deployment or live-service validation is claimed.

Owner copy refinement, 20 November 2026: the generic no-diagnosis notice is removed from the question flow and remains on the final result only, using the owner’s exact wording. The result export retains this same notice. Existing privacy information and result-specific professional/emergency guidance are preserved.


## Latest portrait and question-copy refinement — 20 November 2026

At desktop widths (761px and above), the portrait background is transparent, removing the previous #111 grey contain gutters without cropping or grading the image; mobile is unchanged. The adult label is exactly “Είμαι 18 ετών και άνω”. Q04 inserts an explicit line break before “ποιο θα ήταν;” through an escaped title newline rendered as `<br>`; question meaning, options and scoring are unchanged.

Playwright checks at 390px and 1440px passed for desktop-only background behavior, the exact label, Q04 line break and no horizontal overflow; syntax checks passed. New landing/Q04 screenshots cover both widths. The minimal-results reviewer returned SHIP with no material findings after inspecting the updated desktop landing and Q04 captures. Build and whitespace checks also passed. No global design or implementation contracts changed.

Final reference-accordion verification: SHIP. Independent Chromium checks at 390px/1440px confirmed all four native closed rows and Enter/Space +/- interaction, compact footer privacy in all views, unchecked analytics, exact result-only italic medical note as footer last child, and no expanded overflow/errors or POSTs. Reference comparison was descriptive rather than pixel-based and runtime review sampled CALM with mocked API. Parent eight-width flow/build and offline tests passed; no deployment.
