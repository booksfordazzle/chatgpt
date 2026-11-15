> **Archived:** Supabase is no longer the active signup storage. Use [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md). Do not execute these historical steps for Google setup. Existing Supabase data has not been deleted.

# Connect the PRIMAL CORE waitlist to Supabase

The code and database migration are prepared. **The owner supplied https://exsrdnljhsfkphiatddu.supabase.co. Its migration, credentials and live storage are not yet verified.** The local tests use an isolated PostgreSQL container, not your production database.

## 1. Your project

1. Sign in at https://supabase.com/dashboard and open your existing project `exsrdnljhsfkphiatddu`.
2. Pick an EU region appropriate for your Greek customers and your processor/transfer review. Save the database password privately; the website does not need that password.
3. Wait until the project is available. Keep it private. A free-tier project is fine for evaluation if its current limits fit your needs; check the current plan/pausing/quotas before sending traffic.
4. In the project's connection/API settings, copy the **Project URL** (normally `https://<project-ref>.supabase.co`). This URL is not a secret and may be shared for setup.

## 2. Apply the database migration

Open the project's SQL Editor. Paste and run the complete contents of:

[`supabase/migrations/202611150001_waitlist.sql`](supabase/migrations/202611150001_waitlist.sql)

Run it once in a fresh project, as one transaction. Do not execute the audit's illustrative SQL as well: it is a historical plan, not the active migration. If tables with these names already exist, stop and review them rather than dropping or overwriting data.

The migration creates:

- `waitlist_signups`: email, UTC creation/consent receipt times, exact consent/policy versions, language, form source, bounded campaign attribution and withdrawal state.
- `waitlist_consent_events`: one consent receipt for each new signup.
- `capture_waitlist`: an atomic server-only RPC. Duplicate case variants return the same generic success. Duplicates do not renew consent or re-subscribe withdrawn addresses.

Both tables enable RLS. Browser `anon`/`authenticated` roles have no table access and cannot invoke the RPC. Only the server service role has permissions. Do not add public SELECT/INSERT policies to “make the form work”.

## 3. Add server credentials securely

In Supabase's API-key settings, create/copy a server **secret key** (modern `sb_secret_…`). In **Netlify → your site → environment variables**, add:

| Name | Value / scope |
| --- | --- |
| `SUPABASE_URL` | Your Project URL. |
| `SUPABASE_SECRET_KEY` | Server secret key; mark as sensitive/secret, available to the function runtime. Never expose it in frontend code, build output, or chat. |

A legacy `service_role` JWT may instead use `SUPABASE_SERVICE_ROLE_KEY`; do not set both unless deliberately rotating. Never use a publishable/anon key for this server adapter. The handler supports modern secret keys through the `apikey` header and legacy JWTs through `apikey` + Bearer.

Keep production and deploy-preview credentials separated. `SITE_URL=https://primalcore.gr` is the current canonical build default. Do not change it unless changing the public domain.

For cloud/local testing, add the same variable names through secure environment settings and restart the dev process. The server does not automatically load `.env`. If this cloud environment restricts outbound network access, add **only your exact project hostname** (`<project-ref>.supabase.co`) to its allowed domains; the browser itself never calls Supabase. Proxy-backed secrets must be configured for that exact HTTPS destination. Do not disable TLS verification.

## 4. Deploy the correct branch and test real capture

1. Deploy the updated branch with the existing `netlify.toml`: build `npm run build`, publish `dist`, functions `netlify/functions`.
2. Confirm the migration exists and the function runtime has the two variables, then redeploy/restart if required by the host.
3. Submit an address you control with explicit consent on the **deployed Greek site**. No automatic welcome email is implemented, so the absence of an email is expected.
4. In Supabase's Table Editor/admin SQL, confirm exactly one row in each table; inspect timestamps, locale, consent versions and source. Verify page/query attribution using non-sensitive test campaign tags.
5. Submit the same address, then a different-case version; confirm no second signup or receipt and the original consent time is unchanged.
6. Test the US English page and native/no-JavaScript submission, with a second controlled test address if needed. Confirm errors do not reset an entered email or claim success.
7. Confirm anonymous/publishable credentials cannot read either table or call the RPC. A logged-in Supabase project owner/admin seeing rows is expected; that is not evidence of public access.
8. Check HTTPS/security headers on the real site. Remove controlled test rows through the admin account after validation; consent receipts cascade with the signup.

Do not start paid acquisition until this full deployed check passes. Never treat mocked unit tests or the local PostgreSQL tests as proof of hosted persistence.

## Existing Google Sheets records

The active handler no longer calls Google Apps Script and does not fall back to Sheets. The legacy script is retained as historical source, not an active integration. **No old records have been copied or deleted.** If a previous production Sheet holds real signups, export/reconcile it securely before switching traffic. Preserve original consent timestamps/versions and withdrawal status; do not import old subscribers through the new-signup RPC because that would assign a new consent receipt time. Request a reviewed one-off importer after confirming the source data and legal basis. Keep old access/settings until reconciliation and rollback needs are resolved.

## What to do next from the audit

1. Complete hosted persistence and anonymous-access checks above.
2. Approve interim claim wording and settle the formula. Existing site copy includes both jojoba and mastic, while the new product brief describes alternatives. Claims such as barrier repair, antibacterial protection, regeneration/firming and non-greasy certainty still need evidence/review; this UI/backend task did not silently rewrite them.
3. Confirm the real 15% early-bird terms, update cadence, complete controller address, retention/withdrawal process and processor arrangements. The new privacy page names Supabase, but remaining business details are still yours to confirm.
4. Identify approved original product photos and supporting evidence. Improve the ~17px mobile headline, show open balm texture above the fold, and reduce media/font layout costs in a separate scoped pass.
5. Choose minimal analytics and an email provider only after privacy and capture are reliable. No analytics/pixel, welcome email, automated unsubscribe, queue, referrals or rewards were added. The new “Θέλω προτεραιότητα” label is a signup CTA, not a guaranteed queue rank or a new commercial promise.
6. Add a server-side rate limit before scaling paid traffic. The current protections include the honeypot, origin/input validation and private database RPC, but no rate limit/captcha.

The full original findings are retained in [`AUDIT_REPORT.md`](AUDIT_REPORT.md). It is a dated pre-change audit, not a claim that the new backend still uses Sheets.

## Developer validation

```sh
npm test
npm run build
npm run test:db
```

`test:db` needs Docker and pulls a pinned PostgreSQL 17 image. It creates a temporary container with no external network/host ports, uses no production credentials/data, applies the migration, checks permissions, receipt rollback, duplicates and eight concurrent requests, then removes the container. It does not test Supabase's hosted API gateway, service-key configuration, project quotas, or production connectivity.
