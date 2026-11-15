# Activate Google Sheets signup storage

The active waitlist now uses the existing Google Sheet, not Supabase. The owner has reported successful live Google storage and receipt of the previous optional welcome emails. Live device-column rollout still requires the Apps Script update below. No existing Sheet or Supabase records have been copied/deleted. The current owner preference is an on-page confirmation redirect only; automatic welcome sending is disabled in the current source.

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
4. Test Greek and US English forms and native/no-JavaScript submission. Invalid/unconfirmed storage must show an error and must not claim success. After a confirmed save, JavaScript and native forms open the localized thanks.html confirmation page. Failed saves must not redirect to success.
5. Confirm the Sheet remains private and only authorized staff can access its email records. Remove controlled test rows after validation.

The receiver records email, registration/consent UTC times, consent text/policy versions, locale, form source, bounded UTM fields, referrer origin and landing path. Each row is written under a script lock; formula-like text is escaped. Existing tabs are preserved. The previous five-column Waitlist layout is upgraded by appending missing column headings, leaving old rows/timestamps unchanged. Unexpected/custom header layouts fail safely instead of overwriting data. Empty new fields on old records remain empty; do not invent historical consent evidence.

Current versions: consent `launch-updates-v1`; privacy `2026-11-15-sheets-v1`. Existing duplicate rows are not rewritten. Existing records from Supabase are not imported automatically; request a separately reviewed import if needed.

## Important remaining audit work

Before real acquisition, validate live saving and access permissions, review unsettled formula/skin claims, confirm 15% offer terms, retention/withdrawal operations and processor arrangements. Google Apps Script/Sheets has quotas and the public endpoint has no rate limit/captcha beyond its honeypot/input checks; add suitable rate limiting before scaling traffic. Automatic welcome sending is disabled; the confirmation is shown on the website. It does not implement newsletter campaigns, automated unsubscribe, priority ranking, referrals or rewards.

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

## Confirmation page instead of a welcome email (current owner preference)

After a successful Google save, both forms redirect to `/thanks.html` (Greek) or `/en/thanks.html` (US English). Native/no-JavaScript submissions already use the same localized confirmation pages. A rejected/unconfirmed save keeps the JavaScript form and entered email with an error. No email address or other personal data is added to the redirect URL.

The Greek page reads exactly:

> Μπήκες.
>
> Θα λάβεις μήνυμα όταν το PRIMAL CORE είναι έτοιμο προς διάθεση

The current Apps Script source does not call MailApp, queue welcome messages or send mail from the historical sendPendingWelcomeEmails entry point. It preserves prior subscriber rows and email-history columns; new records have welcome status disabled. The historical setupWelcomeEmails helper only calls the new disableWelcomeEmails helper, so it cannot reactivate sending.

**Stop a previously installed live welcome worker now:** Apps Script → Project Settings → Script properties → change `WELCOME_EMAIL_ENABLED` to the literal string `false` → Save. The old deployed worker reads this property, so no new secret or web-app deployment is needed for that switch. A message already sent/in flight cannot be recalled. Optionally remove only the sendPendingWelcomeEmails time trigger from the clock/Triggers screen. Do not delete spreadsheet rows/history or unrelated triggers.

To fully install the current source, replace Code.gs with the current file, save, optionally Run disableWelcomeEmails (removes only that worker's triggers), and publish a new version of the existing web-app deployment. Keep the current URL/secret unchanged. A Vercel deployment alone does not edit Apps Script or remove its installed Google triggers.

There is no Brevo integration or paid email service in this flow. The requested promise concerns a future launch update; sending that future campaign will require a separately configured, consent-respecting delivery process when the product becomes available. Website confirmation is not evidence of inbox delivery. Directly opening the static confirmation URL does not itself register an email.

## Device type column (latest update)

New registrations include a coarse `Device type`: `mobile` (including tablets), `desktop`, or `unknown` when there is no usable browser context. JavaScript uses device hints with a browser fallback, and native forms use the request User-Agent transiently. The raw User-Agent is never forwarded to Sheets or stored. This is an approximate device category, not a verified identity. Existing duplicate registrations and historical rows are preserved. The receiver adds the new column without replacing existing data.

To activate the new column in the live spreadsheet: copy the full current `google-apps-script/Code.gs` into the existing Apps Script project's Code.gs, save, run `disableWelcomeEmails` once to stop the old welcome trigger, then choose **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. Keep the same deployment URL and existing `SPREADSHEET_ID`/`WAITLIST_SHARED_SECRET`. Vercel updates alone do not update Apps Script. Test with a new email, since existing duplicate rows are deliberately not rewritten. Old rows have no device history and should not be guessed.
