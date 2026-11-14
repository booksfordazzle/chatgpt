# PRIMAL CORE

A Greek prelaunch site for primalcore.gr. Static, server-renderable HTML, self-hosted fonts, responsive WebP images, a supplied 60fps hero film and ingredient film with muted autoplay/loop and independent pause controls, a manually operated ingredient slider, and a full-bleed cinematic product image. No frontend dependencies, analytics, cookies or third-party browser requests.

## Preview by double-clicking (no installation)

Download the latest GitHub ZIP and **extract the entire ZIP first**. Open the extracted folder, then double-click **index.html** at the top level. It opens the site in your browser. Keep the `public` folder and its contents together; do not move the HTML file by itself or open it from inside the ZIP.

Pages, images, styling, navigation and videos use relative paths and work locally. Waitlist submissions require the published server and Google configuration, so local previews clearly say they cannot save emails.

## Develop and verify

Requires Node.js 22 or newer. No dependency installation is necessary.

```sh
npm run dev
npm test
npm run build
```

The development server uses port 8080. `public/` is the editable source; `dist/` is the generated publication directory. Build runs from the repository root and generates canonical URLs, social image metadata, robots.txt and sitemap.xml for `https://primalcore.gr`. Set `SITE_URL` to another HTTPS origin only when intentionally changing domains. Build output is ignored by Git. The source upload remains unchanged outside this repository.

## Connect the supplied Google Sheet

Target spreadsheet: `1ptOmDxONI9KD_rLRZp0xGsjJezsOyIP0H3gd5HgleRg`.

1. Open [the supplied spreadsheet](https://docs.google.com/spreadsheets/d/1ptOmDxONI9KD_rLRZp0xGsjJezsOyIP0H3gd5HgleRg/edit). Choose **Extensions → Apps Script** using the Google account that owns or can edit it.
2. Paste `google-apps-script/Code.gs` into the script project. In **Project Settings → Script properties**, add:
   - `SPREADSHEET_ID`: the ID above.
   - `WAITLIST_SHARED_SECRET`: a strong random value generated with your password manager. Keep it private.
3. **Deploy → New deployment → Web app**. Execute as your account; allow access to **Anyone**. Authorize access to your Sheet. The script checks the secret before writing. Do not publish the spreadsheet itself or make it publicly editable.
4. Copy the deployment URL ending in `/exec`. This is different from the spreadsheet URL and the `/dev` test URL.
5. In the hosting site's server-side environment settings, set `GOOGLE_APPS_SCRIPT_URL` to the deployment URL and `WAITLIST_SHARED_SECRET` to the same private value. Never place either value in `public/`, commit real `.env` values, or send the secret in chat.
6. After publishing the hosting configuration, submit a controlled test email with consent. Confirm a row appears in the **Waitlist** tab. Submit the same email again and confirm only one row exists. Delete test rows afterward.

The receiver creates a separate **Waitlist** tab, preserving existing tabs. It records email, UTC registration time, consent, privacy version and source. A script lock protects concurrent writes and duplicate checks; email values are escaped as text to prevent spreadsheet formulas. Duplicate submissions return the same generic success response without exposing membership. The receiver does not send confirmation or launch emails; sending mail and handling unsubscribe requests remain the owner's operational responsibility. Redeploy a new script version after changing `Code.gs`.

For local integration, export the server-side variables in your terminal before starting `npm run dev`; the development server does not automatically load `.env` files. Without configuration, the API intentionally returns 503 and the form displays an honest retry/contact message.

## Publish on Netlify

1. Deploy this repository with the included `netlify.toml`: build `npm run build`, publish `dist`, functions directory `netlify/functions`.
2. Configure the two server-side Google variables above. Optionally set `SITE_URL=https://primalcore.gr` (this is already the build default).
3. Add `primalcore.gr` as the custom domain, configure DNS as instructed by Netlify, and enable HTTPS. Redirect the `www` variant to the chosen apex domain in hosting domain settings.
4. Verify `/api/waitlist`, an actual saved row, `/blog/`, `/privacy.html`, `/sitemap.xml`, `/robots.txt` and the custom 404 page on the deployed domain. Verify the security headers supplied by `netlify.toml` are active.

A generic static host can serve the pages but **cannot** run the waitlist endpoint. Use Netlify or provide an equivalent server-side adapter. Do not replace confirmed saves with `fetch(..., {mode: 'no-cors'})`; opaque responses cannot prove that a row was saved.

## Before making the site public

- Complete the live Google Sheet integration test. This has not been performed in this workspace; no deployed Apps Script URL or credentials were supplied.
- Confirm the full business address (city/postcode/country), monitored contact mailbox, retention period, hosting/Google processor arrangements and any international-transfer disclosures required for your actual configuration. The supplied legal name and street address are included; missing address details were not invented. Define how withdrawal and deletion requests are handled in Sheets and future mailing tools.
- Confirm the existing images, film and packaging artwork are yours to publish and accurately represent the intended product. The old before/after image and certification claims have been removed. Benefit and ingredient descriptions now use the owner-provided wording; confirm supporting evidence before launch. Product images are labelled as developmental; the packaging artwork contains wording that may differ from the final ingredient list.
- Review the general educational articles and substantiate any quantitative ingredient statements before presenting them as scientific references. The articles are not clinical evidence for PRIMAL CORE.

This handoff prepares source and deployment configuration. It does not publish DNS, deploy Netlify, install a Google Apps Script deployment, or establish regulatory approval for a cosmetic product.

See `REVIEW.md` for the assessment and verification results. Google Sans is self-hosted in Greek/Latin variable subsets, including italics; its SIL Open Font License is in `public/assets/GOOGLE-SANS-LICENSE.txt`.
