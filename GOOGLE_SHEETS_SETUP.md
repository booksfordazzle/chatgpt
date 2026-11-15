# Activate Google Sheets signup storage

The active waitlist now uses the existing Google Sheet, not Supabase. Code/tests are prepared; live Google storage is **not yet configured or verified**. No existing Sheet or Supabase records have been copied/deleted. Welcome email code is now included but must be explicitly authorized/enabled in Apps Script; no real delivery has been verified.

Target: [the existing PRIMAL CORE spreadsheet](https://docs.google.com/spreadsheets/d/1ptOmDxONI9KD_rLRZp0xGsjJezsOyIP0H3gd5HgleRg/edit).

## 1. Open Apps Script from the Sheet

1. Open the spreadsheet above with the Google account that owns/can edit it.
2. In the spreadsheet menu, choose **Extensions → Apps Script** (Επεκτάσεις → Apps Script).
3. If a script already exists, preserve a copy/version before replacing anything. Copy the complete current [`google-apps-script/Code.gs`](google-apps-script/Code.gs) from this branch into the script editor. Save.
4. In the function dropdown beside **Run**, choose **setupWaitlist**, then click **Run**. Approve Google's account permissions for your own script/project. This binds only the agreed spreadsheet and creates a random shared secret if one is not already configured. Repeating setup preserves that secret. It does not expose it in logs.
5. Open **Project Settings → Script properties**. Confirm `SPREADSHEET_ID` is set. Keep `WAITLIST_SHARED_SECRET` private; you will copy it directly into the hosting provider's secure settings, never into chat or public code.

If your organization blocks Apps Script authorization/public web-app execution, an account/admin policy change or another hosting integration is required; do not make the Sheet publicly editable as a workaround.

## 2. Deploy the receiver

1. Click **Deploy → New deployment** (Ανάπτυξη → Νέα ανάπτυξη).
2. Select **Web app** (Εφαρμογή ιστού).
3. Set **Execute as: Me** (Εκτέλεση ως: Εγώ) and **Who has access: Anyone** (Οποιοσδήποτε). Public access is to this authenticated receiver, not to the Sheet. The shared secret still gates writes.
4. Click **Deploy**, then copy the **Web app URL ending in `/exec`**. Do not use a `/dev` URL, the editor URL or the spreadsheet URL.
5. This `/exec` URL can be sent for configuration. Never send the shared secret in chat.

After subsequent source edits, publish a new deployment version. Saving Code.gs alone does not update a previously deployed version.

## 3. Configure the website's server

In your hosting provider's secure server environment settings (Vercel is the current choice), add:

| Variable | Value |
| --- | --- |
| `GOOGLE_APPS_SCRIPT_URL` | The deployment URL ending in `/exec`. |
| `WAITLIST_SHARED_SECRET` | Exactly the secret from Apps Script's Script properties. Mark sensitive/secret; server runtime only. |

Deploy the updated `codex/bilingual-site` branch. Vercel uses `vercel.json` and `api/waitlist.js`; see [VERCEL_SETUP.md](VERCEL_SETUP.md). The retained Netlify configuration is an alternative. Restart/redeploy after changing runtime variables. The function accepts only the Google Apps Script HTTPS endpoint and follows Google's ContentService redirect as a GET without forwarding the secret/body. The browser never receives either server setting.

For this cloud environment, save/review its Google URL/secret requirements and network additions (`script.google.com`, `script.googleusercontent.com`). Saving a draft does not apply it. Local `npm run dev` does not automatically load `.env` files. Old Supabase variables/secret requirements are no longer needed by the active code; remove obsolete requirements from environment settings if they continue to prompt for a value. Do not delete Supabase tables or data merely to switch providers.

## 4. Verify a real signup

1. On the **deployed** site, use an email address you control and check consent.
2. Confirm a row appears in the dedicated **Waitlist** tab and only then regard the signup as verified.
3. Submit the same email again, then a different-case variant. Confirm there is only one row and the original receipt time stays unchanged.
4. Test Greek and US English forms and native/no-JavaScript submission. Invalid/unconfirmed storage must show an error and must not claim success. A welcome is queued only after the optional email feature is authorized/enabled; see the welcome setup below.
5. Confirm the Sheet remains private and only authorized staff can access its email records. Remove controlled test rows after validation.

The receiver records email, registration/consent UTC times, consent text/policy versions, locale, form source, bounded UTM fields, referrer origin and landing path. Each row is written under a script lock; formula-like text is escaped. Existing tabs are preserved. The previous five-column Waitlist layout is upgraded by appending missing column headings, leaving old rows/timestamps unchanged. Unexpected/custom header layouts fail safely instead of overwriting data. Empty new fields on old records remain empty; do not invent historical consent evidence.

Current versions: consent `launch-updates-v1`; privacy `2026-11-15-sheets-v1`. Existing duplicate rows are not rewritten. Existing records from Supabase are not imported automatically; request a separately reviewed import if needed.

## Important remaining audit work

Before real acquisition, validate live saving and access permissions, review unsettled formula/skin claims, confirm 15% offer terms, retention/withdrawal operations and processor arrangements. Google Apps Script/Sheets has quotas and the public endpoint has no rate limit/captcha beyond its honeypot/input checks; add suitable rate limiting before scaling traffic. This integration includes an optional Google-account welcome worker. It does not implement newsletter campaigns, automated unsubscribe, priority ranking, referrals or rewards.

## Developer checks

`npm test` covers server/receiver validation, additive legacy headers, case-insensitive duplicates, versioned consent/attribution, formula escaping, Google redirect safety and truthful UI/locale contracts. `npm run build` generates the static site. These checks use mocks and do not establish Google account permissions, deployment validity or live row persistence. The retained Supabase migration/test files are historical/inactive; they are not part of Google setup.

## Safe error diagnosis

The browser's generic retry message is unchanged. For troubleshooting, the POST JSON response includes a fixed `diagnostic` code on upstream failures; Vercel runtime logs record the same code and, if applicable, the numeric upstream HTTP status. No email, secret, Google redirect URL/query, raw provider body or exception message is logged/returned.

| Diagnostic | What to verify |
| --- | --- |
| `google_login_required` | Google redirects to account sign-in. Verify the exact active deployment executes as the owner and permits Anyone, without requiring a Google login. |
| `google_http_403` | Google denied access. Check deployment permissions and account/organization restrictions. |
| `google_http_404` | Verify the current deployment's exact `/exec` URL; the ID may be wrong, disabled or obsolete. |
| `google_http_429` | Google throttling/quota; check the account's current quotas and traffic. |
| `google_redirect_invalid` / `google_redirect_rejected` | Inspect deployment/account configuration; redirect handling deliberately stays restricted. Do not forward the shared secret to arbitrary destinations. |
| `google_non_json_response` | Google returned a non-JSON page; check public deployment access, deployed code version and Apps Script executions. |
| `receiver_not_confirmed` | Google JSON did not confirm saving. Check the matching secret, current policy/code versions, script properties, Sheet access and supported Waitlist headers. |
| `google_timeout` / `google_network_error` | Review connectivity, Google service health, quotas and Apps Script execution duration. |

These codes guide diagnosis, not proof of a specific root cause. Test a controlled submission only after the new production deployment is Ready; do not rotate a working secret or recreate a Sheet without evidence.

Recognised HTML error pages are additionally mapped to fixed safe codes: `google_do_post_missing` (deployed code lacks doPost), `google_return_missing`, `google_authorization_required`, `google_access_denied`, `google_deployment_unavailable`, `google_traffic_blocked`, `google_script_error`, or `google_html_service_response` (HTML-service UI rather than a JSON receiver). These are signature-based hints, not verification of a particular root cause; unknown HTML retains `google_non_json_response`. No raw HTML, page title, exception detail or personal data is exposed. If HTML cannot be classified, compare the exact active deployment URL with the Vercel value and inspect Apps Script Executions for the matching doPost attempt.

## Find the saved record

Emails go into the **Waitlist worksheet/tab inside the same spreadsheet**, not into the original blank Sheet1 tab. Use the sheet tabs along the bottom (or the All sheets menu at bottom left) to select Waitlist. A blank original tab does not establish that a signup was not saved. If Waitlist is absent, compare the spreadsheet URL/ID with the agreed target above and the private Apps Script SPREADSHEET_ID property; do not share a screenshot of secrets or subscriber data.

## Enable welcome emails from your Google account

The owner selected Google-account sending for now. Mail is sent by the Google account that owns/runs this script, with display name PRIMAL CORE. It is **not** sent from hello@primalcore.gr. Messages are plain text, Greek or US English according to the signup language, and contain registration confirmation, development status and instructions to reply to request removal. No queue rank, launch date, discount entitlement or product efficacy is invented.

1. Copy the complete latest `google-apps-script/Code.gs` into the **same bound Apps Script project**, save, and preserve existing Script Properties/secret.
2. Select **setupWelcomeEmails** from the function dropdown and click Run. Approve the new mail and trigger permissions for your own script. This setup preserves the spreadsheet/secret, enables the mail worker and installs only one recurring trigger; it does not send messages itself.
3. Publish the code via **Deploy → Manage deployments → Edit → New version → Deploy**, keeping Me / Anyone. Prefer updating the currently working deployment so its URL stays unchanged; update Vercel + redeploy only if the URL changes.
4. Submit a controlled signup again. An existing record that has never had welcome sending enabled can be queued once by that repeat submission, without changing the original consent timestamp. Existing subscribers are **not** mass-enrolled by setup alone.
5. In Waitlist, inspect **Welcome email status** and **Welcome email sent at (UTC)**. The scheduled worker runs approximately every five minutes and processes at most ten per run, subject to your Google account's quota. For the controlled test you can manually Run **sendPendingWelcomeEmails** after capture instead of waiting. This function sends actual pending messages; do not repeatedly run it to force a retry.
6. Check the receiving inbox/spam. `sent` means MailApp accepted the send, not proof that it reached the inbox. `pending` may mean waiting/quota exhausted; `not_enabled` means setup has not enabled it; `failed` requires owner review. `sending` after an interrupted run needs manual reconciliation before retrying, because MailApp does not provide an exactly-once delivery/idempotency guarantee.

Storage and email are independent: signup success requires a post-flush readback of the saved email, but does not wait for welcome delivery. An email-service failure leaves the saved signup intact. Duplicate submissions do not re-send entries marked sent/sending/failed/suppressed. There is no automatic retry for ambiguous/failed sends; after checking the actual send outcome an owner may explicitly set a confirmed-unsent entry back to pending. Rows marked **suppressed** are not queued/sent by this welcome worker. Handle reply-based withdrawal requests, mark suppression and exclude them from any future campaigns; this is an owner process, not a complete automated unsubscribe system.

New status columns are appended without rewriting old data. Mail provider calls occur outside the signup lock; each claim/result update uses a short lock. The welcome worker is locally mocked/tested only; actual Google authorization, trigger scheduling, quota and inbox delivery need the owner's live controlled test. No real email was sent from this development workspace.
