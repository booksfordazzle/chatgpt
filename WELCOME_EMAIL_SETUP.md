# Free PRIMAL CORE thank-you email

This revision supersedes the older no-welcome instructions in GOOGLE_SHEETS_SETUP.md.
The source is ready; pushing to Vercel does **not** update the live Google Apps Script.

## Message

Greek subject: PRIMAL CORE — Σε ευχαριστούμε για την εμπιστοσύνη

> Σε ευχαριστούμε για την εμπιστοσύνη. Θα λάβεις μήνυμα όταν το PRIMAL CORE είναι έτοιμο προς διάθεση.

English signups receive the equivalent English message. Both messages include the site link and a reply-to-withdraw sentence. The display name is PRIMAL CORE; the sender is the Google account executing the trigger. Replies go to ermitikos@gmail.com. No domain mailbox or paid provider is required.

## Activate in the existing Google project

1. Open the existing spreadsheet → Extensions → Apps Script. Save a copy/version of the current source first.
2. Replace Code.gs with the complete current `google-apps-script/Code.gs` from this branch; save. Preserve all Script Properties, Sheet data and existing deployment URL.
3. Run `setupWelcomeEmails` once and authorize the Google permission to send email. It installs exactly one five-minute welcome worker and enables only the new flow. Repeating it preserves data and the existing secret. Do not run a manual send to the existing list.
4. Deploy → Manage deployments → Edit the **existing** web app → Version: New version → Deploy. Keep Execute as: Me, Access: Anyone and the same /exec URL. No Vercel environment change is needed.
5. Register a **new email you control** on primalcore.gr. Check the private Waitlist tab for `pending-thanks-v1`, then wait for the scheduled worker (normally a few minutes, subject to Google scheduling).
6. Verify the thank-you in that inbox/spam and the Sheet status `sent-thanks-v1` with a timestamp. Repeat the signup: it must not send a second message. Test English with another controlled new address.

This source never sends while saving a registration. Mail delays or quota limits do not turn a saved signup into an error. Existing historical subscribers (including rows previously marked disabled/pending/sent) are not backfilled. Both existing hero/footer forms use the same receiver and retain their source/consent/version fields. No dependencies or frontend tracking changes.

## Limits and status

Consumer Gmail Apps Script normally allows 100 email recipients per day, shared with other scripts in the same account and subject to change. The worker checks actual remaining quota, sends at most 10 messages per run and leaves excess pending for later. It runs approximately every five minutes; no exact delivery time or inbox placement is guaranteed.

- `disabled`: registered before the new flow was enabled; never automatically sent.
- `pending-thanks-v1`: new consented registration awaiting quota/worker.
- `sending-thanks-v1`: claimed and flushed before calling Google. If interrupted, left for manual review rather than retrying a potentially sent message.
- `sent-thanks-v1`: Google accepted the send, not proof of inbox receipt.
- `review-thanks-v1`: provider exception; no automatic retry because outcome can be ambiguous. Review before manually requeuing to avoid duplicates.

The worker skips rows without consent or with a previous send timestamp. A script lock protects queue claims, then releases before contacting the mail provider. No email address, secret or provider exception is logged.

Run `disableWelcomeEmails` to disable future sending and remove only the welcome trigger; Sheet/history and unrelated triggers remain intact. This does not recall mail already in flight. Withdrawal replies require the owner to remove the recipient from pending/future launch lists; this is not an automated unsubscribe or launch campaign service.

Quota reference: https://developers.google.com/apps-script/guides/services/quotas
