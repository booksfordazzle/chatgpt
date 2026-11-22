# GA4 production audit — 22 November 2026

## Root cause before changes

The reported custom-event loss was **not reproduced**. The actual deployed handlers generated `skin_profile_view` and `quiz_start`, and the real Google runtime serialized them into a batched POST collect body. Reading only the request's query-string `en`, or inspecting before batch flush, does not enumerate its events. This is a supported explanation for the observation, not proof of what the user's four inspected requests contained. No GA4 Admin/Realtime access or user HAR was available.

A duplicate initial pageview **was reproduced**. The deployed code disables automatic pageviews only on the destination-level `config`, after `js` initialization. It also explicitly emits a manual `page_view`. With the real, property-specific Google runtime, the default container initialization still produced an initial automatic pageview, then the manual pageview appeared in the batch. An early **global** `set/send_page_view/false` suppressed that automatic default while preserving the explicit pageview and both custom events.

The smallest fix is that early global command in `public/analytics.js`. No quiz handlers, event contract, consent decisions, email delivery, waitlist submission, research storage, SMTP configuration or Apps Script endpoints were changed by this GA4 fix.

## Evidence inspected

Fetched actual production HTML (`/`, `/skin-profile`), `/analytics-config.js`, `/analytics.js` and `/skin-profile/app.mjs`:

- Generated configuration contains `G-LNTWZZCRX4`.
- One local analytics loader and one destination config were found; no second GA/GTM HTML installation was found.
- Deployed analytics SHA-256: `2a3c7f6d9730a5e7c58e2185d94480e15ea47cb68dcedd9111df2b9230e5bf41`.
- Deployed app SHA-256: `af5cbd8d7047ce484def601b0b73587cf66435fffecee6083b0867658ed15461`.
- `currentPage()` emits a manual pageview once per document and emits the landing event only while the landing is visible.
- The app's delegated `change` handler checks `validAnswer`, then guards the first-answer event with `aggregateQuizStarted`. Start alone does not emit it.
- `trackOnce` sends fixed event/form fields; attempt IDs remain tab-local and are never GA4 parameters.

The public Google tag response for this property also has automatic history and form events enabled (`vtp_enableHistoryEvents`, `vtp_enableForm`). This is a further source of potential automatic events. The timed question-1/2/3 experiment did not establish that history caused the user's four pageviews. Review Admin settings instead of assuming all repeated pageviews share one cause.

That remote response also enables automatic user-provided-data detection flags. This audit did **not** observe or prove email/answer/profile transmission. App event parameters are allowlisted, and ad user data remains denied. Disable unnecessary automatic form/history/user-provided-data features in Google tag settings to keep collection aligned with the deliberate event contract.

## Controlled real-runtime comparison

Used production page/code and the real Google tag library, fresh browser contexts, accept analytics, Start, first valid answer, then navigate through question 3. Repeated with delays between interactions and enough time for batching. All collect requests were intercepted and fulfilled locally with synthetic HTTP 204 responses; application POSTs were blocked. No quiz submissions, emails or collect events were delivered to production services by these experiments.

| Variant | Decoded page_view | skin_profile_view | quiz_start |
|---|---:|---:|---:|
| Deployed baseline | 2 | 1 | 1 |
| Only early global automatic-pageview-off added | 1 | 1 | 1 |

Before consent there were zero collect attempts. The fixed candidate retained one tag script/config, and the app reached question 3 without JS errors. One request can contain multiple `en=…` lines in its POST body; it is not one event per network row.

**These are controlled browser emission tests, not proof of GA4 ingestion or a deployed production fix.** The candidate was served through a local browser route override; production files/configuration were not modified. The sandbox browser needed to ignore its local TLS trust-chain limitation for testing only; no website TLS/security settings were changed.

## Exact change

Immediately after default-denied consent is queued, and before any `js`, `config` or script loading:

```javascript
tag('set', 'send_page_view', false);
```

Keep destination `send_page_view:false`, existing `currentPage` guard, event allowlist, PII filtering, and all consent gating. No forced per-event flush or retrospective replay was added.

## Regression coverage

- `tests/browser/skin-analytics.cjs`: default-denied/rejected requests; first-answer start; rendered completion; failed vs confirmed survey/email actions; PII filtering; withdrawal; reload dedupe. New assertions require global automatic-pageview-off before `js` and one destination config.
- `tests/browser/ga4-transport.cjs`: contract fixture with container default before destination configuration and batched explicit events. Checks one decoded pageview, landing/start events, repeated accept, history and withdrawal. The fixture is not claimed to replicate every Google library behavior; the real-runtime comparison above provides the separate integration evidence.
- `tests/ga4-collect.test.mjs` + `tests/browser/ga4-collect.cjs`: parse both query and batched POST event names.
- Existing lead tests keep form parameters and server-confirmed semantics.

## Deployment and manual production check

Merge/deploy the GA4 PR to Vercel. No environment-variable, SMTP or Apps Script change is required. The Measurement ID is already correct.

1. In a fresh Chrome profile, open DevTools Network, disable cache, clear the log, and open `/skin-profile` with clean storage. Filter `collect`, but also inspect `gtag/js`.
2. Before consent or after rejection: no Google script or collect request. Check cookies as well.
3. Accept while landing is visible. Expect one initial page_view and one skin_profile_view. Google may batch them; open **Payload**, not only Query String Parameters, and inspect each POST line's `en`. Allow time for batching or briefly background the tab. Do not count network rows as event counts.
4. Click Start: no quiz_start yet. Select a first valid answer: one quiz_start. Continue to question 3; changing answers/Back/Forward should not create another start or automatic pageview for the question steps.
5. Complete all ten questions: one quiz_complete only after the result renders. Refresh/back/forward of an existing result must not replay completion. A real document reload can legitimately produce a new page_view; test that separately from a single-document count.
6. On a fresh document with consent already granted, expect one page_view again. Reopening settings and clicking Accept within the same document must not initialize another tag or create another pageview.
7. Verify existing survey/lead events only after confirmed successful submissions using controlled addresses/data. Mere visits and failed submissions are not leads. Check fixed `form_id` values; no addresses/answers/profiles/IDs/query/fragments/referrer URLs in event payloads.
8. Withdraw: no new custom events, GA cookies cleared and future loads stay blocked until fresh acceptance. Prior accepted events already sent cannot be withdrawn from the Google service by deleting browser cookies.
9. In GA4 Realtime compare the named event counts on the correct `G-LNTWZZCRX4` stream. Standard reports can lag. DebugView needs debug mode/Google Analytics Debugger and property access; no permanent production debug_mode was enabled.
10. In GA4 Admin → Data streams → web stream → Enhanced measurement/settings, disable automatic history/form interactions and unnecessary user-provided-data detection; do not add a second tag. The code fix does not claim to change private Admin settings.

## PageSpeed links supplied by owner

Inspected the existing mobile report data, not a new Lighthouse run:

- Home report (21 Nov): performance 95, LCP 2.9s, TBT 0ms, CLS 0, SEO 100.
- Skin Profile report (21 Nov): performance 91, LCP 3.5s, TBT 0ms, CLS 0.001, SEO 69.

These reports do not establish GA4 custom-event delivery. No unrelated performance/indexing/layout change was folded into this minimal analytics fix. Result-email visual presentation is a separate change.
