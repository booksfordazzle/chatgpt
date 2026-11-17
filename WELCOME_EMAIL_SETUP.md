# PRIMAL CORE welcome email — direct Papaki SMTP

This replaces the Gmail/MailApp/alias approach. Source pushed to Vercel is only half of activation: the owner must configure SMTP secrets there and update the existing Apps Script project. No new paid provider or domain mailbox is needed; the existing Papaki mailbox's sending limits apply. Do not promise unlimited/free delivery beyond that plan.

## Message and sender

From: PRIMAL CORE <hello@primalcore.gr>. Reply-To and envelope sender: hello@primalcore.gr.

> Σε ευχαριστούμε για την εμπιστοσύνη. Θα λάβεις μήνυμα όταν το PRIMAL CORE είναι έτοιμο προς διάθεση.

English registrations receive the equivalent English message. Both include the site link and a reply-to-withdraw sentence. No tracking pixels, attachments or advertising offer. Withdrawal replies must be processed by the owner before any further campaign; a reply is not an automated unsubscribe operation.

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

The existing receiver stores the consented registration and marks only new records pending. It never delays signup confirmation with an SMTP call. Every five minutes, the Apps Script worker claims up to five pending rows and calls /api/welcome-email over HTTPS using the existing server secret. SMTP credentials stay only on Vercel.

Before SMTP, Vercel calls the authenticated Google receiver to atomically match the row number, email, registration timestamp, language, consent and unsent state. It then changes the state to smtp-claimed-thanks-v1 under a script lock. Each job can be authorized once even if requests are replayed across multiple Vercel instances. Fixed message content and sender prevent an arbitrary mail relay. The /api endpoint is not a browser submission endpoint and denies requests without authentication. Readiness is authenticated and tests TLS/login without sending.

The Google ContentService redirect is restricted to HTTPS script.googleusercontent.com/macros/echo and followed as GET without forwarding secret or body. No email, SMTP credentials or raw provider exceptions are logged/returned. Nodemailer is the one added dependency; it implements SMTP/TLS rather than custom protocol code.

## Status and recovery

- disabled/blank/legacy pending: not automatically backfilled; preserve historical records.
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
