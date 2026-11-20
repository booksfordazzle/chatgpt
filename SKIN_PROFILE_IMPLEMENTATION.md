# PRIMAL CORE Skin Profile — draft implementation

## Current minimal quiz/results refinement — 20 November 2026

Keep THE PRIMAL SKIN PROFILE and the ten-question flow. During quiz screens remove series/DISCOVER/numeric labels and hide the desktop header label; retain the thin native progress element, navigation and accessible question controls. The five identities, supplied photos, core stories, three native story disclosures and visible priority sentences remain.

The result interface no longer offers copy/edit tools, visible morning/evening protocols, ingredient/habit/specialist disclosures or guide/email delivery. Remove their frontend handlers as well; no missing-element handlers should run. Retain the medical disclaimer, AAD sources inside the explanation disclosure, and CALM's medical/emergency guidance within its story. Remove the concept's ingredient/philosophy links and opening marketing CTA. Keep optional five-question research v2, independent unchecked bottom marketing and restart. The privacy copy no longer promises unavailable copy/email functions.

The legacy backend email action and `resultText` remain compatible for existing integrations, but there is no result-delivery or copying UI exposed on this route. Do not present that compatibility as a visitor feature. Engine, server and data architecture, v2 default-off flag/migration requirement, global design and deployment status are unchanged.

Latest evidence: build, eight-width browser flow and offline ten-question/five-result checks pass without missing-element errors. The minimal-results finish review returned SHIP with no blocking findings; the reviewer confirmed the refreshed desktop question capture hides the series label and remains clean. Earlier SHIP/test records below describe their earlier revisions, not final review of this refinement. No production deployment or live email verification was performed.

## Current series and research contract — 20 November 2026

The current name is **THE PRIMAL SKIN PROFILE**, using **THE SKIN INTELLIGENCE SERIES / 01 DISCOVER** on the landing; these labels and the numeric label are removed during the quiz. Start CTA: “Ξεκίνα το τεστ”. Retain all ten quiz questions temporarily, as explicitly confirmed by the owner; do not shorten to seven or add question hints. Fingerprint treatment and all five profile photos remain unchanged. Scoring and the result engine are unchanged.

The optional research v2 asks five single-select questions defined exactly in `public/skin-profile/questions.mjs`: `problem`, `routine`, `unmet`, `concept`, and hypothetical `price` for a 50ml concept. Their allowed option counts are 8/7/9/7/7. All are optional/skippable, submission consent starts unchecked, and “other” options do not collect free text. These are research choices, not raw quiz answers or a clinical profile.

The UI enables v2 only when capabilities return `researchV2: true`. Server action `research-v2` writes independent daily counters `research_v2:{field}:{index}`. Keep legacy actions and metrics compatible and separate: the new hypothetical 50ml price question is not the legacy usual-spending measure. No emails, raw quiz answers, results, response-level joins or unique-lead qualification are collected. Counts cannot reconstruct individual combinations or establish buyers. This is not randomized price testing or a live offer.

Release dependency: `SKIN_PROFILE_RESEARCH_V2_ENABLED` defaults off. Apply `supabase/migrations/202611200001_skin_profile_research_v2.sql` before enabling it. The service-only migration permits the five bounded counter families; browser clients receive no database credentials. Existing database configuration, privacy review and reviewed release remain necessary. Do not enable v2 merely because local tests passed.

Current evidence: 102 unit tests and the build passed, all migrations passed in isolated PostgreSQL, eight-width browser QA passed, and offline checks passed the ten-question flow, five profiles and all five research questions. Review artifacts: `/workspace/audits/skin-profile/skin-intelligence-preview.html` and `skin-intelligence-results.html`; the results gallery has seven review-only selectors (home, five profiles, research), absent from production. The series finish review returned SHIP with v2 collection OFF until its migration is applied. Research screenshots at 390px/1440px are element crops, not full-viewport captures; retain this review limitation. Field Core Web Vitals and live emails are not verified. No global design or source-homepage change is part of this revision. No production deployment was performed.

Historical sections below record earlier revisions; the current minimal refinement and series/research contract above take precedence. Earlier descriptions of result copy, edit, protocols or email UI are historical, not available visitor actions.

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

The current results expose only independent optional marketing, not a result-delivery form. The retained legacy result-email server route never creates marketing consent. Existing waitlist behavior is preserved. The draft adds a dedicated `primal-core-skin-profile` source and a separate education/development/launch consent purpose; the payload still contains only email/explicit consent and bounded campaign attribution, never the quiz profile or raw answers.

## Data flow and consent

The ten answers are tab-memory only. No cookies, localStorage, sessionStorage, profile URLs, authentication or AI API. Reload/close deliberately loses answers. The unexposed legacy result-delivery API accepts only email, primary/secondary priority codes and named habit flags with its existing explicit-request contract; it is not offered by the current route. The server generates a fixed plain-text message; it does not accept arbitrary HTML, store the profile, log message data or write an email receipt to a CRM. SMTP/mailboxes necessarily process and retain the email according to their service settings, disclosed in the page.

Marketing opt-in is separate, unchecked and uses existing waitlist consent logging/withdrawal. Current optional research v2 posts only bounded choice indices for problem, routine, unmet need, concept and hypothetical 50ml price, after explicit anonymous submission consent; legacy interest/spend/information-need research remains a separate compatible namespace. No email, quiz result, IP field, UTM or visitor/session ID is accepted by this endpoint. Only daily per-option counts are stored; there are no response-level joins. The current five-question UI follows the v2 capability gate and optional skip controls.

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
