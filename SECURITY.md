# Security hardening — 16 November 2026

## Implemented and tested

- Static frontend with no npm runtime/frontend dependencies, no public admin/login or database credentials in the browser. A targeted tracked-source credential-pattern scan found no private-key, GitHub-token, AWS-access-key or live payment-key patterns. This is not a full historical secret audit.
- Existing strict CSP, no inline/eval scripts, no embedding, limited form destinations, private Google Sheet and server-only authenticated Apps Script writes are preserved.
- HTTPS enforcement through HSTS (`max-age=31536000`) and CSP upgrade-insecure-requests. COOP/CORP isolate same-origin content. Headers are consistent between Vercel and Netlify.
- Waitlist rejects malformed/cross-site browser origins and cross-site Fetch Metadata, oversized bodies, wrong methods/types, invalid email, missing consent and honeypot hits. Oversized Content-Length is rejected before body parsing in the Vercel adapter.
- Repeated valid signup attempts are limited to 5 per email and 20 per platform-provided IP per 10 minutes, per warm server instance. Native submits receive the existing localized failure redirect; JSON submits receive 429 plus Retry-After and localized browser feedback. Rejected attempts do not call Google storage. Counters are bounded to 5,000 salted, hashed keys in memory; raw IP/email counters are not persisted or logged.
- Contact standard submission enables FormSubmit CAPTCHA and retains the honeypot. Removed the CAPTCHA-disabled AJAX route. After provider acceptance visitors return to a branded Greek/English page; no automatic email tests were sent.
- Existing spreadsheet formula escaping, duplicate protection, write read-back, timeout, Google-only redirect validation and generic safe diagnostics are covered by tests.

## Verification scope

Node tests cover rate limits and expiry, bounded limiter capacity, malformed/cross-site requests, early request-size rejection, safe headers, contact configuration, consent, storage, and bilingual pages. Browser checks intercept contact submissions to verify CAPTCHA is enabled and return destinations are correct; they do not prove CAPTCHA enforcement or inbox delivery at the external provider.

Read-only production checks before this commit: homepage returned 200 with CSP/frame protection, GET /api/waitlist returned 405, and /.env and /.git/config returned 404. These checks are not a penetration test.

## Remaining deployment/account requirements

1. **Vercel edge security:** confirm the project has Vercel DDoS protection and Firewall/Bot Protection enabled as appropriate to its plan. Configure a path-specific rate-limit/challenge rule for `/api/waitlist` and inspect Security logs. This task has no authenticated Vercel settings access, so no account-level setting is claimed as changed. Do not use an aggressive whole-site challenge that blocks legitimate visitors or search engines unnecessarily.
2. **Distributed bot resistance:** in-memory throttling resets on cold start and is not shared between server instances; it is a first layer, not a global rate limit. A distributed limiter and server-verified challenge tokens (for example Turnstile, requiring owner-controlled site/secret keys) are needed against determined/distributed signup spam.
3. **Third-party contact limits:** FormSubmit's public recipient endpoint and client-selectable options remain provider-controlled. Enabling CAPTCHA in our normal form does not prove attackers cannot call that endpoint directly with altered options. Strong enforcement requires provider/account settings that cannot be overridden by clients, or migration to a server-owned contact endpoint with server-verified challenge tokens and an authenticated mail service. No claim of complete contact-spam prevention is made.
4. **Account access:** enable MFA/passkeys for GitHub, Vercel, Google and FormSubmit; retain least-privilege access and rotate secrets if compromise is suspected. No passwords or account settings were changed here.
5. **Functional verification:** the owner should perform one real contact submission, complete the provider challenge, check the localized return page and Gmail receipt. FormSubmit activation has previously been confirmed by the owner. The code does not bypass activation.

No site can be guaranteed safe against all attacks. Keep hosting/runtime security patches current and monitor rejected requests and email abuse.
