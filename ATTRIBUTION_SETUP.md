# Session attribution and device capture

## Status and deployment

Frontend capture, both original forms, the Vercel endpoint and Apps Script source are updated. Consent, Privacy version and Consent text version logic are unchanged. No new form, dependency, cookie banner or cross-session ID was added.

**Live Sheets verification is pending.** Google connector metadata calls returned `Unknown tool`, and no Apps Script deployment capability is available in this session. Do not claim that the six columns have appeared in the production Sheet until the existing web app is redeployed and a row is read back. An old deployment can accept the email while ignoring new attributes.

Deploy the current `google-apps-script/Code.gs` as a **new version of the existing web-app deployment**, preserving its `/exec` URL and private Script Properties. Do not create a public spreadsheet or reset the shared secret. The first subsequent valid signup appends missing headers automatically under the existing lock. No subscriber row or existing consent field is rewritten.

## Exact schema

The repository's current full schema is below. **A:R are existing columns; S:X are the six new columns.** The live header row could not be read. The migration uses header names, retains whatever existing order is present and appends only missing names; if earlier legacy columns are missing, those are appended too. Any custom existing columns remain in place. Do not manually reorder the Sheet to match this table.

| Column | Header |
| --- | --- |
| A | Email |
| B | Registered at (UTC) |
| C | Consent |
| D | Privacy version |
| E | Source |
| F | Consent received at (UTC) |
| G | Consent text version |
| H | Locale |
| I | UTM source |
| J | UTM medium |
| K | UTM campaign |
| L | UTM term |
| M | UTM content |
| N | Referrer origin |
| O | Landing path |
| P | Welcome email status |
| Q | Welcome email sent at (UTC) |
| R | Device type |
| S | device_type |
| T | os |
| U | browser |
| V | landing_page |
| W | referrer_full |
| X | screen_width |

The existing `Device type` column is retained, while the explicitly requested `device_type` column is appended. Both support tablet in the updated receiver. Existing automatic welcome-email sending stays disabled.

## Capture and payload

- `public/attribution.js` initializes on every page, including pages without a form. Existing `public/site.js` submits its snapshot through the existing `/api/waitlist` path for both original forms.
- Only `sessionStorage` is used, with one fixed key `primal-core-attribution-v1`, no random/user identifier. No localStorage or cookie is used. Each nonempty current UTM replaces the stored value for that key; missing/blank UTMs never erase it. First landing pathname + search and first entry referrer stay unchanged during navigation. Closing the tab ends the session according to browser semantics (browser tab restore may restore sessionStorage).
- `landing_page` preserves the first pathname + search. `referrer_full` preserves the full first document.referrer if the browser supplies it; a browser may supply only an origin or an empty value. The code cannot recover information withheld by referrer policy.
- `device_type`, `os`, `browser`, `screen_width` and `viewport` describe coarse categories/current viewport at submission. iPad desktop-style UA is handled with basic touch/width signals; CriOS/FxiOS/EdgiOS are distinguished. Brave is detected only when its standard `navigator.brave.isBrave()` API is available; spoofed or privacy-reduced UAs cannot always be distinguished.
- Existing Sources in this repository remain `primal-core-hero` / `primal-core-footer` without renaming; receiver also accepts `primal_core_hero` / `primal_core_footer` from the task context.
- Missing optional attributes and UTMs are sent as `""`, not null/undefined. UTM values are capped at 128 characters; full URLs at 2,048 characters. Server enums/URL schemes are checked. Payload limit is 16 KiB to accommodate URL metadata, with formula escaping still applied in Sheets.
- `viewport` is captured, persisted and sent as requested (e.g. `390x844`); **no seventh new Sheet column** is added because the requested append schema lists only six. `screen_width` is stored in X for the standard schema above.
- No IP address, precise location, raw user-agent, fingerprint or persistent ID is added to attribution. Existing separate, ephemeral abuse-rate counters are unaffected.
- With unavailable/blocked sessionStorage, capture continues in memory for the current page. Across-page persistence then cannot be guaranteed. With JavaScript disabled, native signup still works but these client-only attributes are absent/empty.

## Privacy

Both language privacy pages describe session-only attribution and include the requested technical-information statement. Session storage ends with the browser session; submitted attributes remain with the email record under the site's retention policy. Full landing/referrer URLs can contain personal data; never put email addresses, secrets or personal IDs in campaign URLs. Session-only/first-party processing is not automatically exempt from applicable GDPR/ePrivacy requirements. The owner should confirm lawful basis, data minimization and retention. Existing consent UI and stored policy/consent identifiers were intentionally not changed, and no new banner was added.

## Development logging

Run `NODE_ENV=development npm run dev`. Only this development server prepends `window.PRIMAL_DEV = true` to its served script; payload logging is gated on that flag. Production build assets never enable it. Do not use real subscriber data in development logs.

## Exact test links

Use the working Vercel production origin until the custom domain is intentionally switched.

- Instagram bio: https://chatgpt-weld-mu-98.vercel.app/?utm_source=instagram&utm_medium=bio&utm_campaign=launch_test&utm_content=test-post
- Threads: https://chatgpt-weld-mu-98.vercel.app/?utm_source=threads&utm_medium=social&utm_campaign=launch_test&utm_content=test-post
- Facebook: https://chatgpt-weld-mu-98.vercel.app/?utm_source=facebook&utm_medium=social&utm_campaign=launch_test&utm_content=test-post

For launch, replace `launch_test` with a consistent campaign label and use a distinct `utm_content` per creative/link placement. Do not manually append blank parameters.

## End-to-end live verification after Apps Script redeployment

1. In a fresh tab/session open the Instagram test URL above. Browse to Blog or English, then back to a form page **without** UTMs.
2. Submit a new test email from the hero form, with the unchanged required consent checked. Confirm the on-page waitlist confirmation and the uploaded video popup on desktop. No automatic confirmation email is introduced.
3. Read the new row in the private Google Sheet: UTM source instagram, medium bio, campaign launch_test, content test-post, first landing path+query, available referrer, correct device/OS/browser and screen width. Referrer may legitimately be blank for a pasted test URL.
4. Repeat using a different test email from the footer; ensure its existing Source is retained. Use separate fresh sessions to test Threads and Facebook. Rate limit remains five attempts per email and twenty per platform IP per ten minutes per server instance.
5. Confirm an existing row/consent timestamp was not overwritten. Duplicate emails intentionally retain their original record.

Automated coverage includes session persistence, blocked storage, device/browser classification, actual browser payloads for both forms, Node→Apps Script append logic, preserved records/consent, and desktop video playback. Intercepted browser submissions are not evidence of a live Sheet write.
