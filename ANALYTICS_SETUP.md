# PRIMAL CORE — consented analytics and daily dashboard

## Status and boundaries

Owner confirmed on 21 November 2026 that GA4 and Search Console properties do not exist yet. No real Measurement ID or Search Console token has been configured or verified by this change. Source defaults intentionally contain no measurement ID, so no Google tag loads until owner setup AND analytics consent. Email registration, SMTP result delivery and anonymous quiz/survey storage already have separate flows; this change does not create a CRM or add addresses to GA4.

GA4 measures only consenting visitors. Ad blockers and declined consent make the funnel incomplete. Counts below are actions, not unique prospects, diagnoses or sales. Search Console traffic is a separate Google Search dataset and does not use this visitor-consent mechanism.

## Event contract

| Event | Exact trigger | Parameters |
|---|---|---|
| `skin_profile_view` | Current landing is visible when analytics starts on a page load | none |
| `quiz_start` | First valid answer in a new quiz attempt; never the start button alone | none |
| `quiz_complete` | Completed result has rendered after all ten valid answers | none |
| `survey_start` | Explicit research CTA opens the survey | none |
| `survey_complete` | Server confirms successful research submission | none |
| `generate_lead` | Confirmed result-email submission or accepted waitlist submission; contact completion redirect only with a pending valid form submission in the same tab | `form_id`: `result_email`, `waitlist`, `contact` |
| `early_access_signup` | Waitlist server confirms a new registration, not an existing subscriber | none |
| `product_interest` | A successfully submitted survey explicitly chooses “Με ενδιαφέρει να το δοκιμάσω” | none |

The contact form is external FormSubmit with CAPTCHA. Its completion redirect is not a delivery receipt; a direct visit/refresh to contact-sent does not create a lead. The API must return `registration: new` before early_access_signup fires; older receivers without that flag do not invent new-signup counts. Repeated accepted form submissions can count as lead actions; they are not unique email addresses.

Quiz/survey starts and completions are deduplicated per functional attempt within the tab after consent. Their IDs stay local and are not GA4 parameters. No events from before consent are queued for retroactive transmission. Reloading a result or returning with Back/Forward does not replay its completion.

## 1. Owner creates GA4

1. In Google Analytics, create/select an account and create a GA4 property for PRIMAL CORE. Use Europe/Athens reporting time zone and EUR.
2. Add a Web data stream for `https://primalcore.gr` and copy its public Measurement ID `G-…`.
3. In Vercel Production, add `GA4_MEASUREMENT_ID=G-…`, then rebuild/redeploy. This is a build-time public ID, not an API secret. A mere environment save without rebuild does not change generated analytics-config.js.
4. Turn off Enhanced Measurement automatic form interactions/pageviews and other automatic interaction measurements so they do not duplicate the controlled events. Keep Google signals, ads personalisation, user-provided data collection and ads linking disabled. Do not install a second GA/GTM tag through another integration. Set the event-data retention to the minimum appropriate period (2 months available in standard GA4).
5. Register an event-scoped custom dimension: name Form, parameter `form_id`. Do not register email, answer or profile dimensions.
6. Mark `generate_lead` and, if desired, `early_access_signup` as key events. Do not mark landing visits as leads. Review reports for double-counting if summing these two overlapping stages.
7. Verify Real-time/DebugView after accepting analytics, using mocked/test interactions or a controlled real submission. Standard daily reports can lag, and the current day is incomplete.

## 2. Owner creates Search Console

1. Create a URL-prefix property for `https://primalcore.gr/` in the owner's Google account.
2. Choose HTML-tag verification and copy only the token in `content="…"` (not the whole tag).
3. Add `GOOGLE_SITE_VERIFICATION` in Vercel Production; rebuild/redeploy, then click Verify in Search Console.
4. Submit `https://primalcore.gr/sitemap.xml`. The existing sitemap/canonicals/robots remain; this does not change the indexing status of provisional routes. Domain/DNS verification is an alternative and does not need this token.

No ownership, indexing, historical data or Google-account access has been claimed by this implementation.

## 3. Daily dashboard in existing research workbook

The ready script creates **Analytics Dashboard** in Validation Results PRIMAL CORE, separate from Skin Quiz and Skin Research. It fetches only GA4 aggregate dates/counts for the last 30 days: daily sessions, users, pageviews and the eight funnel events. A line chart compares daily sessions and quiz completions. Existing response tabs and integrations are untouched.

1. In the existing Apps Script project add a NEW file named `AnalyticsDashboard.gs`. Paste the contents of this repository's `google-apps-script/AnalyticsDashboard.gs`. Do not replace Code.gs.
2. From GA4 Admin → Property details copy the numeric Property ID (different from G-…). Add it as the non-secret Script Property `GA4_PROPERTY_ID`.
3. In Apps Script → Services → +, add **Google Analytics Data API** with identifier **AnalyticsData**. The executing owner must have access to that GA4 property. For a custom Google Cloud project, enable the Analytics Data API there too.
4. Keep the existing project, receiver code and permissions. No Gmail scope or service-account secret is needed. If you already use explicit OAuth scopes in appsscript.json, preserve them and add analytics.readonly; otherwise the advanced service handles the authorisation prompt.
5. Save and run `refreshAnalyticsDashboard`, authorising access to aggregate Analytics reports. No web-app deployment or integration URL change is required for this editor-run report.
6. Optional: run `enableAnalyticsDashboardDaily` to explicitly install one 07:00 Europe/Athens daily trigger. It first verifies a successful report refresh and leaves mail triggers untouched. Manual refresh remains available.

The report completes both GA4 reads before replacing dashboard-owned cells. If access/API validation fails, it does not erase the previous report. On first activation there may be no data; no example numbers are used. Headers, numeric formats and date order are generated; live native rendering and values remain unverified until owner setup.

## Consent and separation

- Basic consent mode: Google scripts and requests are blocked until analytics acceptance. Ad-related storage/user-data/personalisation remain denied.
- Equal accept/reject choices; persistent Cookie settings permits withdrawal. On withdrawal new events stop, GA cookies and optional attribution/dedupe state are cleared. A local choice record expires after 180 days.
- Campaign attribution storage and signup attribution fields are also gated; no optional storage read/write before consent. Browser state needed for quiz progress, submission deduplication or security remains separate.
- Email-result consent, anonymous-answer storage consent and waitlist marketing consent stay independent. Rejecting analytics must not block any of those flows.
- Only fixed event names/form enums are allowed. Event payloads have no emails, names, messages, quiz answers, skin categories or submission IDs. Query strings, fragments and referrer URLs are not sent to GA4 by this integration. Do not add such data through GA4 Admin or another tag.
- Consent texts describe the technical implementation; do not claim legal certification or completeness of visitor counts.

## Verification checklist

No Google requests/cookies before acceptance or after rejection. One first-answer quiz_start; no generate_lead for a mere quiz view. No completion event on failed submission or reload. Correct `form_id` for each form. Duplicate existing waitlist subscriber is not a new signup. Analytics rejection does not prevent actual form submission. Search Console verification checked only after token deployment. Dashboard readback/native rendering checked only after property access and authorisation.
