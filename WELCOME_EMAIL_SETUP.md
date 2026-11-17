# PRIMAL CORE welcome email — direct Papaki SMTP

This replaces the Gmail/MailApp/alias approach. Source pushed to Vercel is only half of activation: the owner must configure SMTP secrets there and update the existing Apps Script project. No new paid provider or domain mailbox is needed; the existing Papaki mailbox's sending limits apply. Do not promise unlimited/free delivery beyond that plan.

## Message and sender

From: PRIMAL CORE <hello@primalcore.gr>. Reply-To and envelope sender: hello@primalcore.gr.

> Καλώς ήρθες. Θα λάβεις μήνυμα όταν το PRIMAL CORE είναι έτοιμο προς διάθεση.

English registrations receive the equivalent English message. Both include the site link and a reply-to-withdraw sentence. Three locale-aware inline CID image attachments carry the bull, Greek or English heading, and existing closed-jar photograph; a plain-text alternative is included. No remote imagery, tracking pixels or advertising offer. Withdrawal replies must be processed by the owner before any further campaign; a reply is not an automated unsubscribe operation.

## Current visual template

The owner's black-and-white BECYCLE reference applies to the confirmation email: a centered 160px bull header (CID `primal-core-bull`), ivory “Καλώς ήρθες” / “Welcome” heading, real product photograph, existing launch-update promise, outlined site CTA and privacy/contact/address footer. The bull replaces the image wordmark. `public/assets/email-bull.png` is exported from native alpha `bull-trans.png`, trimming only transparent canvas. Subject and plain-text greeting match the welcome heading. Background #000000, foreground #f1f0e9 and muted #b4b5ae remain unchanged.

The heading uses actual Google Sans rendered at 2× as `email-welcome-el.png` or `email-welcome-en.png` by `scripts/render-welcome-headings.cjs` with the supplied WOFF2. Its CID image sits inside an accessible H1 with matching alt text, and the plain-text greeting remains available. This avoids Gmail webfont substitution for the heading. Body text keeps the Google Sans stack, self-hosted WOFF2 with font-only CORS in `vercel.json`, Arial/Helvetica fallbacks and the Outlook fallback; body font appearance is not guaranteed across all clients. The server bundle glob includes the bull, both heading images and product photograph. The website's global design remains unchanged. Surface details and review evidence are recorded in [.impeccable/surfaces/welcome-email.md](.impeccable/surfaces/welcome-email.md).

`server/welcome-template.mjs` supplies the bilingual HTML and inline images. Run `node scripts/preview-welcome-email.mjs` to regenerate `previews/welcome-el.html` and `previews/welcome-en.html` without sending mail. The latest Greek and English screenshots replace the previous previews at the same paths; all 71 tests and layout checks at 320px, 390px and 1440px passed. Browser previews do not validate actual inbox rendering or delivery.

For the already configured SMTP flow, the new template takes effect with its Vercel deployment. This visual update requires no Apps Script editing, new Sheet claims or changes to existing Google configuration. The activation steps below describe initial SMTP setup, not steps to repeat for this template update.

## Activation order

1. In the existing Apps Script, Run `disableWelcomeEmails` to stop the prior Gmail worker while switching. Keep the Sheet and deployment URL.
2. In Vercel project Settings → Environment Variables, add the following for **Production only**, server-side. Mark SMTP_PASSWORD sensitive. Do not change the existing GOOGLE_APPS_SCRIPT_URL or WAITLIST_SHARED_SECRET, and never put secrets in chat, public files or source code.

| Variable | Value |
| --- | --- |
| SMTP_HOST | smtp-gr.securemail.pro |
| SMTP_PORT | 465 |
| SMTP_USER | hello@primalcore.gr |
| SMTP_PASSWORD | The existing hello mailbox password; enter directly in Vercel |

Port 465 uses implicit SSL/TLS. Port 587 is supported only with required STARTTLS; certificate validation and TLS 1.2+ are always enforced. Server hostname comes from the existing Papaki 2.0 service and DNS; confirm account details with Papaki if login fails. Do not disable certificate checks. Other SMTP hosts are intentionally rejected in source.

3. Redeploy Production after adding the variables. No browser/client environment variables.
4. Save a backup/version of the current Code.gs. Replace it with the full current google-apps-script/Code.gs. Save. Keep Script Properties, existing secret, Sheet ID and URL. Do not delete any rows or other project triggers.
5. **First publish** a new version of the existing live receiver deployment: Deploy → Manage deployments → select the Web app whose URL exactly matches Vercel GOOGLE_APPS_SCRIPT_URL → Edit → New version → Deploy. Preserve Execute as: Me and access Anyone. Publishing before setup ensures the new atomic claim action is live before enabling the worker.
6. Run `setupWelcomeEmails` and approve the Google external-request/trigger permissions. It privately verifies SMTP TLS/login through Vercel **without sending mail**, then installs one five-minute trigger and enables the SMTP flow. No Gmail alias, Gmail permission, SMTP password in Apps Script or Gmail API is required. If the private connection check fails, setup throws a fixed message instead of enabling it.
7. Use a **new email you control** on primalcore.gr; verify the Sheet, actual inbox/Spam, sender/reply-to, and reply delivery to hello. Repeat the same signup to confirm no second mail. Test English with a second controlled address. Do not use other people's email addresses for tests.

## Architecture and duplicate protection

The receiver saves consent before returning a private immediate job for a new registration. Vercel starts that job under `@vercel/functions` `waitUntil` as signup succeeds, without holding the browser response for SMTP. The job never reaches the browser. The five-minute Apps Script trigger is recovery only: it handles legacy pending rows and unstarted immediate jobs older than 60 seconds. SMTP credentials stay only on Vercel.

This removes the normal five-minute application delay. It does not guarantee inbox delivery within three seconds: Papaki and recipient mail servers can queue accepted messages. With the old Google deployment, Vercel remains compatible but continues the old queued behavior until the current Code.gs is published.

Before SMTP, Vercel calls the authenticated Google receiver to atomically match the row number, email, registration timestamp, language, consent and unsent state. It then changes the state to smtp-claimed-thanks-v1 under a script lock. Each job can be authorized once even if requests are replayed across multiple Vercel instances. Fixed message content and sender prevent an arbitrary mail relay. The /api endpoint is not a browser submission endpoint and denies requests without authentication. Readiness is authenticated and tests TLS/login without sending.

The Google ContentService redirect is restricted to HTTPS script.googleusercontent.com/macros/echo and followed as GET without forwarding secret or body. No email, SMTP credentials or raw provider exceptions are logged/returned. Nodemailer implements SMTP/TLS; `@vercel/functions` keeps immediate background work alive after the HTTP response. Template assets are loaded before claiming the send.

## Status and recovery

- disabled/blank/legacy pending: not automatically backfilled; preserve historical records.
- pending-immediate-thanks-v1: saved and ready for the immediate job; recovery may claim it only after 60 seconds.
- pending-thanks-v1: waiting for worker. Missing server configuration before a send safely leaves it pending.
- sending-thanks-v1: claimed by worker before HTTP; interrupted work requires review.
- smtp-claimed-thanks-v1: authorized once by the receiver, before SMTP; interrupted work requires review.
- sent-thanks-v1: provider accepted the send; not proof of inbox delivery.
- review-thanks-v1: uncertain/provider failure; no automatic resend. Inspect before manually requeuing, since it might already have been accepted.

The pending rows created by the previous thank-you revision are compatible; sent/review/disabled rows are not automatically sent again. Enabling the new worker therefore may send genuinely pending test registrations. Delete only owner-approved test rows or mark their status disabled before setup if they should not send. Existing consent, dates, source, versions and attribution remain intact. Sending limits/bounces/spam policies are controlled by Papaki; mailbox replies and delivery failures must be monitored.

Run disableWelcomeEmails to pause and remove only the welcome trigger. It does not delete records or recall in-flight mail. No automated launch campaign is implemented.

## DNS and delivery verification

Keep existing MX and SPF. Never add a second SPF record. Check the provider's DKIM instructions for this exact mailbox/product and publish only its supplied selector/value. Current DMARC monitoring can stay p=none while validating; do not enforce reject until legitimate senders pass alignment. Use a controlled received message's full headers to confirm SPF/DKIM/DMARC and From: hello. SMTP acceptance alone does not establish authentication or inbox delivery.

Provider references:
- https://support.papaki.com/help/how-do-i-set-up-my-email-on-a-mac/?lang=en
- https://support.papaki.com/help/which-settings-should-i-use-in-a-mail-client/?lang=en

## Safe readiness diagnosis

Run `checkWelcomeEmailConnection` from the current Code.gs editor without deploying or enabling the worker. It performs the same authenticated no-send SMTP readiness check and logs only a numeric HTTP status and an allowlisted code. Never share secret properties or raw provider responses. Fixed reason codes distinguish missing/invalid host, port, username/password presence, shared-secret mismatch, SMTP authentication, DNS, timeout and TLS errors; they are diagnostic hints, not proof of a specific root cause. A `ready` result proves the connection/login check passed at that moment, not inbox delivery. Fix Production environment values, redeploy Vercel and rerun before enabling the worker.

The current `checkWelcomeEmailConnection` also requests `?receiver=1&immediate=1`: after SMTP login verification, Vercel sends a secret-authenticated `check-welcome-immediate` probe to the live Google deployment. This action returns readiness only and never reads/writes subscriber rows or sends. Publish the current Code.gs into the correct existing deployment before using this full-chain check. A rejected probe reports `receiver_not_ready`; network/redirect/provider problems report `receiver_check_failed`. The sender logs only allowlisted HTTP/reason codes (`SMTP send: HTTP …`) on future executions; historical review records remain unchanged and must not be automatically retried. A successful probe does not prove that any particular job is authorized or that SMTP delivery will succeed.

## Upgrade an already configured installation to immediate sending

Keep all SMTP variables, Script Properties, records and the existing deployment URL. Replace Code.gs with the full current source, save, then edit **PRIMAL CORE — LIVE Receiver — Vercel** in Manage deployments and publish **New version**. Run `checkWelcomeEmailConnection` (expect HTTP 200 / ready), then `setupWelcomeEmails`. Test with one new controlled address. Do not requeue historical sent/review rows. The immediate path is active only after this Google update.

Immediate readiness now also tries the read-only legacy probe when the immediate probe is rejected. `receiver_version_outdated` means the configured live URL accepts the shared secret but runs an older SMTP receiver without immediate support. Publish the current source into that exact deployment. `receiver_not_ready` means both probes were rejected; check the deployment URL and unchanged shared-secret match. Neither probe sends mail or changes subscriber rows. This diagnosis does not establish whether a previously accepted message reached an inbox.
