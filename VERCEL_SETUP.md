# Publish PRIMAL CORE on Vercel and connect primalcore.gr

The repository now supports Vercel's Node function at `/api/waitlist` and static build output in `dist`. No Vercel project, live deployment, domain/DNS change or hosted signup verification has been performed from this workspace. Local checks do not establish hosted readiness.

## 1. Import the correct GitHub source

1. Sign in at https://vercel.com using the GitHub account with access to `booksfordazzle/chatgpt`.
2. Choose **Add New → Project** and import that repository. Grant Vercel access only to the repository it needs. Choose a plan permitted for your commercial use; check Vercel's current plan terms rather than assuming a free plan covers a brand's commercial site.
3. The prepared code is on **`codex/bilingual-site`**, not `main`. Select this branch if the import UI offers a branch selector. If it does not, create the project, then go to **Project Settings → Git → Production Branch**, set `codex/bilingual-site`, and create/redeploy a Production deployment from this branch under **Deployments**. Do not connect the public domain to an older `main` deployment.
4. Root Directory: repository root (`./`). Framework Preset: **Other**. The committed `vercel.json` defines build `npm run build`, output `dist`, Node function duration and security headers. No frontend package installation is needed. Do not deploy only the `public` folder or ZIP: the root `api/` function and server handler are required for real signups.

## 2. Add the two server environment variables

Under the new project's **Environment Variables** (or Project Settings → Environment Variables), set these for **Production**:

| Name | Value |
| --- | --- |
| `GOOGLE_APPS_SCRIPT_URL` | `https://script.google.com/macros/s/AKfycbwuvbi7_oRABZeIeYcTYojKTO8tH3APWf-vxHrnDPCISVOtWTsyX-LUMCxPcjAqEuuX/exec` |
| `WAITLIST_SHARED_SECRET` | Copy directly from your Apps Script **Project Settings → Script properties**. Store as a sensitive/secret server variable. Do not paste it in chat, GitHub, public code or screenshots. |

The owner reported `setupWaitlist` completed successfully; that does not yet prove a hosted website can save a row. Use the same current secret on both sides. If editing environment variables after a deployment, redeploy Production so its function receives them. Do not expose variables with a `NEXT_PUBLIC_`/`VITE_` prefix; the browser must never call Apps Script directly. Preview deployments need their own intentional credential choice; do not enable production-sheet writes on untrusted pull requests by default.

The Apps Script deployment must be **Web app → Execute as Me → Anyone**. The underlying Sheet stays private. Its deployed version must match the current `google-apps-script/Code.gs`; saving editor source alone does not publish a version.

## 3. Test before switching the domain

1. Open the successful Vercel deployment URL, not a downloaded `file:` preview.
2. Verify the Greek homepage, flag switch, English page, blog navigation/assets and privacy page. Directory trailing slashes are configured intentionally because the HTML uses relative links; retain `cleanUrls:false` so `.html` links continue to work.
3. Submit one email you control with consent. Confirm a new row in the existing private Sheet's **Waitlist** tab. Verify timestamp, locale/source and consent versions. Welcome emails require the optional Apps Script setupWelcomeEmails activation; see GOOGLE_SHEETS_SETUP.md.
4. Submit the same email and an uppercase variant. Confirm one row and unchanged original consent time. Test the other form and US English/native submission. Errors must retain the email and must not claim a save.
5. A normal browser GET to `/api/waitlist` should return HTTP 405, not a static 404. A 503 after a valid POST means the runtime variables are missing/invalid; a 502 requires checking Apps Script deployment/version/permissions/shared secret. Inspect provider logs without exposing credentials or emails.

Local validation available: `npm test` (shared handler, Sheets receiver and Vercel adapter), `npm run build`. The adapter is tested with parsed JSON/forms, raw bodies, body caps, same-origin rejection, native localised redirects and unconfigured storage. Vercel's hosted routing, Google permissions and real row persistence must still be verified on deployment. The Netlify adapter is retained for compatibility; its filename does not make the shared handler Netlify-only.

## 4. Connect the domain you already own

1. Once the Production deployment is verified, open **Project Settings → Domains** in Vercel and add **primalcore.gr**.
2. Add **www.primalcore.gr** and configure it to redirect to the apex `primalcore.gr`, matching the site's canonical URL.
3. Vercel will show the exact DNS records required for this project. At your domain registrar/DNS provider, apply **those exact records** for the apex and `www`; do not guess an IP/CNAME from an old tutorial. No registrar transfer is needed.
4. Preserve unrelated DNS records, especially email MX/TXT/SPF/DKIM/DMARC records. Do not reset all records or switch nameservers merely to connect the site.
5. Wait until Vercel reports valid configuration/HTTPS. Then test real HTTPS on both hostnames, the www redirect, Greek/English pages, `/api/waitlist`, privacy, robots and sitemap, and one controlled save/duplicate flow through **primalcore.gr**.

`SITE_URL` already defaults to `https://primalcore.gr`; keep that canonical origin. Vercel issues/manages HTTPS after DNS is correct; issuance and propagation are not immediate guarantees. The domain is not connected by this repository commit.

## What remains before acquisition

The original audit's claim/formula, offer terms, retention/withdrawal, verified product imagery, mobile headline/performance and rate-limit tasks remain. Hosting the site does not validate its skin claims or launch offer. No analytics/pixel, automated unsubscribe, queue or referrals are implemented. Optional Google-account welcome delivery requires owner activation and a real delivery test. Use [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) for receiver details and [AUDIT_REPORT.md](AUDIT_REPORT.md) for the historical audit.
