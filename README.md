# PRIMAL CORE

A Greek prelaunch site for primalcore.gr. Greek/English static, server-renderable HTML, self-hosted fonts, responsive WebP images, a supplied 60fps hero film and ingredient film with muted autoplay/loop and independent pause controls, a manually operated ingredient slider, and a full-bleed cinematic product image. No frontend dependencies, analytics or advertising cookies. The contact form uses FormSubmit to forward enquiries to Gmail; see CONTACT_SETUP.md for required one-time recipient activation.

## Preview by double-clicking (no installation)

Download the latest GitHub ZIP and **extract the entire ZIP first**. Open the extracted folder, then double-click **index.html** at the top level. It opens the site in your browser. Keep the `public` folder and its contents together; do not move the HTML file by itself or open it from inside the ZIP.

Pages, images, styling, navigation and videos use relative paths and work locally. Waitlist submissions require the published server and Google Apps Script configuration, so local previews clearly say they cannot save emails.

## Languages

Greek pages live directly in `public/`; their complete US English counterparts live in `public/en/`, including every blog article and the privacy and registration pages. The 🇺🇸 / 🇬🇷 flag switch opens the corresponding page and works without JavaScript. Keep both language versions in sync when editing copy. Shared styles, scripts and media remain in `public/`. The build includes both languages in the sitemap, with language alternatives declared in each source page. Form feedback and native submission redirects follow the selected language.

## Develop and verify

Requires Node.js 22 or newer. No dependency installation is necessary.

```sh
npm run dev
npm test
npm run build
```

The development server uses port 8080. `public/` is the editable source; `dist/` is the generated publication directory. Build runs from the repository root and generates canonical URLs, social image metadata, robots.txt and sitemap.xml for `https://primalcore.gr`. Set `SITE_URL` to another HTTPS origin only when intentionally changing domains. Build output is ignored by Git. The source upload remains unchanged outside this repository.

## Connect Google Sheets

The active waitlist uses the previous Google Sheet through a server-only Apps Script receiver. Follow [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md): open the Sheet → Extensions → Apps Script, save the current `google-apps-script/Code.gs`, run its `setupWaitlist` helper, deploy as a web app, then securely configure `GOOGLE_APPS_SCRIPT_URL` and `WAITLIST_SHARED_SECRET` in the hosting function runtime.

The Sheet stays private. A dedicated Waitlist tab records emails, timestamped/versioned consent and minimal attribution. Duplicates are case-insensitive and preserve old records. Existing five-column headers are upgraded additively. Success requires a confirmed write; without configuration the API returns 503 and retains the entered email. Local dev does not automatically load `.env`.

Supabase is no longer called by the active handler. Its source/migrations remain for historical reference; no records have been deleted/imported, and `npm run test:db` exercises only that inactive historical schema. Confirmed signups redirect to the localized thanks.html page. Automatic welcome emails are disabled in the current source; see GOOGLE_SHEETS_SETUP.md to stop any previously installed Google welcome worker. Automated unsubscribe and priority ranking are not implemented.

## Publish on Vercel (current requested host)

Follow [VERCEL_SETUP.md](VERCEL_SETUP.md). Import `booksfordazzle/chatgpt` from branch `codex/bilingual-site`, framework Other, repository root. `vercel.json` builds `dist`, and `api/waitlist.js` adapts the same validated Google Sheets handler to Vercel Node requests. Set server-only `GOOGLE_APPS_SCRIPT_URL` and `WAITLIST_SHARED_SECRET`, deploy, verify a real Sheet row, then add `primalcore.gr` and `www.primalcore.gr` in Vercel Domains using the exact DNS records Vercel provides. No deployment or DNS change has been performed here.

## Publish on Netlify

1. Deploy this repository with the included `netlify.toml`: build `npm run build`, publish `dist`, functions directory `netlify/functions`.
2. Configure the two server-only Google variables above and deploy the Apps Script receiver. Optionally set `SITE_URL=https://primalcore.gr` (this is already the build default).
3. Add `primalcore.gr` as the custom domain, configure DNS as instructed by Netlify, and enable HTTPS. Redirect the `www` variant to the chosen apex domain in hosting domain settings.
4. Verify `/api/waitlist`, an actual saved Google Sheet row and its consent fields, `/blog/`, `/privacy.html`, `/sitemap.xml`, `/robots.txt` and the custom 404 page on the deployed domain. Verify the security headers supplied by `netlify.toml` are active.

A generic static host can serve the pages but **cannot** run the waitlist endpoint. Use Netlify or provide an equivalent server-side adapter. Do not replace confirmed saves with `fetch(..., {mode: 'no-cors'})`; opaque responses cannot prove that a row was saved.

## Before making the site public

- Complete the live Google Sheet save/duplicate/privacy tests. No Apps Script deployment URL or secret is currently configured here; mocked tests do not establish live readiness.
- Confirm the full business address (city/postcode/country), monitored contact mailbox, retention period, hosting/Google processor arrangements and any international-transfer disclosures required for your actual configuration. The supplied legal name and street address are included; missing address details were not invented. Define how withdrawal and deletion requests are handled in Sheets and future mailing tools.
- Confirm the existing images, film and packaging artwork are yours to publish and accurately represent the intended product. The old before/after image and certification claims have been removed. Benefit and ingredient descriptions now use the owner-provided wording; confirm supporting evidence before launch. Product images are labelled as developmental; the packaging artwork contains wording that may differ from the final ingredient list.
- Review the general educational articles and substantiate any quantitative ingredient statements before presenting them as scientific references. The articles are not clinical evidence for PRIMAL CORE.

This handoff prepares source and deployment configuration. It does not publish DNS, deploy Netlify, deploy your Google Apps Script receiver, or establish regulatory approval for a cosmetic product.

See `REVIEW.md` for the assessment and verification results. Google Sans is self-hosted in Greek/Latin variable subsets, including italics; its SIL Open Font License is in `public/assets/GOOGLE-SANS-LICENSE.txt`.
