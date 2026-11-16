# Double opt-in recommendation — not implemented

The actual repository uses Google Apps Script + Google Sheets, not Supabase. No file in `api/`, `netlify/functions/` or `google-apps-script/` was changed by this audit. Existing consent/version fields and records were not rewritten. No mail was sent or real signup created during this audit.

Before launch, recommend double opt-in and a working unsubscribe link in every marketing email. This needs separate approval and backend deployment; editing frontend copy does not implement these functions. Existing automatic welcome sending remains disabled in source.

If the owner chooses **Supabase**, the approved implementation needs:

- A private subscriber table with normalized unique email, status (`pending`, `confirmed`, `unsubscribed`), original consent timestamp, privacy/consent-text version, locale, Source and the approved attribution fields. Confirmation/unsubscribe timestamps are separate; never replace the original consent record.
- Confirmation token **hash**, expiry, used-at and created-at; use cryptographically random one-use tokens, never raw tokens in database/logs. Store an unsubscribe-token hash or verify a signed opaque token server-side; no email address in the URL.
- Server endpoints for signup, token confirmation and unsubscribe, with validation, honeypot, distributed throttling/challenge verification, token expiry and atomic one-use consumption. Repeat confirmations/unsubscribes must be safe/idempotent.
- RLS that denies public subscriber reads/writes. Only the server may use service-role credentials, stored in hosting secrets, never browser bundles. No public lookup that reveals whether an email exists.
- An authenticated transactional mail provider, a verified sender/domain and templates for the confirmation request and subsequent launch updates. Do not send launch mail to pending/unsubscribed records. Every marketing email must include its functioning unsubscribe URL.
- An auditable consent/confirmation/unsubscribe history, an owner-approved retention/deletion schedule, suppression handling, privacy notice and tests for replay, expired tokens, enumeration, abuse and deletion. Agree frequency and legal basis first; no invented interval or retention duration is supplied.

The current Sheets backend would need analogous private token/status storage, atomic locking and approved mail-provider integration if retained. Do not migrate backend, add Supabase, alter live records or enable mail until the owner approves that work.
